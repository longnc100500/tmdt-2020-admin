import React, { Component, useEffect, useState } from 'react';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import {
	Button,
	Icon,
	Grid,
	Radio,
	RadioGroup,
	FormControlLabel,
	Checkbox,
	TableCell,
	Table,
	TableBody,
	TableRow,
	TableHead,
	Select,
	MenuItem,
	InputLabel,
	CircularProgress,
} from '@material-ui/core';

import ImageUploader from 'react-images-upload';

import {
	MuiPickersUtilsProvider,
	KeyboardDatePicker,
} from '@material-ui/pickers';
import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { SimpleCard } from 'matx';
import SimpleMenu from '../menu/SimpleMenu';
import { IconButton } from '@material-ui/core';
import Color from '../../utilities/Color';
import {
	addNewProduct,
	getAllProducts,
	updateProduct,
	updateProductsRedux,
} from 'app/redux/actions/ProductAction';
import MySpinner from 'matx/components/MySpinner';
import { useSelector, useDispatch } from 'react-redux';

import axios from 'axios';
import MyAlert from 'matx/components/MyAlert';
import { useHistory } from 'react-router-dom';

const CATEGORY = {
	smartphone: 1,
	laptop: 2,
	tablet: 3,
	accessories: 4,
};
const BRAND_OBJECT = {
	Apple: 1,
	Acer: 2,
	Asus: 3,
	Dell: 4,
	HP: 5,
	Lenovo: 6,
	Samsung: 7,
	LG: 8,
	Huawei: 9,
	Oppo: 10,
	Xiaomi: 11,
	Vivo: 12,
	Nokia: 13,
	Sony: 14,
	Vsmart: 15,
	MSI: 16,
};
const BRAND_LIST = [
	'Apple',
	'Acer',
	'Asus',
	'Dell',
	'HP',
	'Lenovo',
	'Samsung',
	'LG',
	'Huawei',
	'Oppo',
	'Xiaomi',
	'Vivo',
	'Nokia',
	'Sony',
	'Vsmart',
	'MSI',
];
const UpdateProductForm = ({ productInfo, token }) => {
	const dispatch = useDispatch();
	const history = useHistory();

	const oldImages = productInfo?.images?.map((v) => v.url);
	const [state, setState] = useState({
		name: productInfo?.name || '',
		description: '',
		brand: productInfo?.brand?.id || '1',
		date: new Date(),
		category: productInfo?.category?.name || 'smartphone',
		price: productInfo?.price || 0,
		quantity: productInfo?.stock || 0,
		image: oldImages && oldImages.length ? oldImages : [],
		tempImg: '',
		cpu: productInfo?.description?.cpu || 'none',
		ram: productInfo?.description?.ram || 0,
		os: productInfo?.description?.os || 'none',
		screen_size: productInfo?.description?.screen_size || 0,
		battery: productInfo?.description?.battery || 0,
		memory: productInfo?.description?.memory || 0,
		color: productInfo?.description?.color || 'red',
		introduction: productInfo?.description?.introduction || 'none',
	});
	const [isLoadImage, setIsLoadImage] = useState(false);

	const { products } = useSelector((state) => state.productReducer);

	useEffect(() => {
		ValidatorForm.addValidationRule('isPasswordMatch', (value) => {
			if (value !== state.password) {
				return false;
			}
			return true;
		});
		return ValidatorForm.removeValidationRule('isPasswordMatch');
	}, []);
	const _handleGetAllProduct = async () => {
		try {
			const data = await getAllProducts();
			console.log('all products list', data);
			updateProductsRedux(dispatch, data);
		} catch (err) {
			MyAlert.show('L???i', `${err.message}`, false);
			console.log('Get All product list err', err);
		}
	};

	// componentWillUnmount() {
	// 	// remove rule when it is not needed
	// 	ValidatorForm.removeValidationRule('isPasswordMatch');
	// }

	const handleSubmit = async () => {
		try {
			MySpinner.show();

			console.log('submitted');
			console.log('data ne', state);
			console.log(convertData());
			console.log('this state img', state.image);
			const newData = convertData();
			const sendData = JSON.stringify(newData);

			console.log(sendData);
			if (productInfo?.id) {
				const res = await updateProduct(token, productInfo?.id, sendData);
				await _handleGetAllProduct();
				history.replace('/product/product-list');
				// const newProductList = [
				// 	...products.filter((v) => v.id !== productInfo.id),
				// 	newData,
				// ];
				// updateProductsRedux(dispatch, newProductList);
				console.log('response', res);
			} else throw new Error('Cannot get Product Id to update');
			MySpinner.hide(() => {}, {
				label: 'Update Product Success !',
				value: 0,
			});
		} catch (err) {
			MySpinner.hide(() => {}, {
				label: `Update Product Failed ! \n ${err.message}`,
				value: 1,
			});
			console.log('send data err', err);
		}
	};

	const handleChange = (event) => {
		event.persist();
		setState({ ...state, [event.target.name]: event.target.value });
	};

	const handleDateChange = (date) => {
		console.log(date);

		setState({ ...state, date });
	};
	const addImage = () => {
		console.log('temp Img', state.tempImg);
		setState({
			...state,
			image: [...state.image, state.tempImg],
			tempImg: '',
		});
	};
	const _deleteImg = (img) => {
		let newList = state.image.filter((v) => v !== img);
		setState({ ...state, image: [...newList] });
	};
	const convertData = () => {
		let {
			name,
			introduction,
			brand,
			category,
			date,
			price,
			image,
			quantity,
			cpu,
			ram,
			screen_size,
			color,
			battery,
			os,
			memory,
		} = state;
		const newImgs = image;
		return {
			Name: name,
			Price: price * 1,
			BrandId: brand * 1 + 1,
			CategoryId: CATEGORY[category] * 1,
			Stock: quantity * 1,
			images: image,
			description: {
				Cpu: cpu,
				Ram: ram,
				Color: color,
				ScreenSize: screen_size,
				Battery: battery,
				Os: os,
				Memory: memory,
				Introduction: introduction,
			},
		};
	};
	const onDrop = async (picture) => {
		setIsLoadImage(true);
		let formData = new FormData();
		if (picture && picture.length) {
			for (let i = 0; i < picture.length; i++) {
				formData.append('files', picture[i]);
			}
		} else {
			formData.append('files', picture);
		}
		console.log('image ne', picture);
		// setState({
		// 	...state,
		// 	image: [...state.image, picture],
		// 	// tempImg: '',
		// });
		const { data } = await axios.post(
			'https://minhlnd.azurewebsites.net/images',
			formData
		);
		console.log('Image list ne', data);
		setState({ ...state, image: [...oldImages, ...data] });
		setIsLoadImage(false);
	};
	let {
		name,
		description,
		brand,
		category,
		date,
		price,
		image,
		quantity,
		tempImg,
		cpu,
		ram,
		screen_size,
		color,
		battery,
		os,
		memory,
		introduction,
	} = state;
	return (
		<div>
			<SimpleCard>
				<ValidatorForm onSubmit={handleSubmit} onError={(errors) => null}>
					<Grid container spacing={6}>
						<Grid item lg={6} md={6} sm={12} xs={12}>
							<TextValidator
								className="mb-16 w-100"
								label="ProductName"
								onChange={handleChange}
								type="text"
								name="name"
								value={name}
								validators={[
									'required',
									'minStringLength: 4',
									'maxStringLength: 1000',
								]}
								errorMessages={['this field is required']}
								variant="outlined"
							/>
							<InputLabel>Category</InputLabel>
							<RadioGroup
								className="mb-16"
								value={category}
								name="category"
								onChange={handleChange}
								row
								validators={['required']}
							>
								<FormControlLabel
									value="smartphone"
									control={<Radio color="secondary" />}
									label="Smart Phone"
									labelPlacement="end"
								/>
								<FormControlLabel
									value="laptop"
									control={<Radio color="secondary" />}
									label="Laptop"
									labelPlacement="end"
								/>
								<FormControlLabel
									value="tablet"
									control={<Radio color="secondary" />}
									label="Tablet"
									labelPlacement="end"
								/>
								<FormControlLabel
									value="accessories"
									control={<Radio color="secondary" />}
									label="Accessories"
									labelPlacement="end"
								/>
							</RadioGroup>
							<InputLabel>Brand</InputLabel>
							<Select
								validators={['required']}
								style={{ width: '100px', height: '50px' }}
								className="mb-16 w-50"
								defaultValue={[brand]}
								onChange={(v) => {
									setState({ ...state, brand: v?.target?.value });
								}}
							>
								{BRAND_LIST.map((v, i) => (
									<MenuItem value={i}>{v}</MenuItem>
								))}
							</Select>
							{category !== 'accessories' ||
							productInfo?.category?.id !== 4 ? (
								<div>
									<TextValidator
										className="mb-16 w-100"
										label="CPU"
										onChange={handleChange}
										type="text"
										name="cpu"
										value={cpu}
										validators={['required']}
										errorMessages={['this field is required']}
										variant="outlined"
									/>
									<TextValidator
										className="mb-16 w-100"
										label="Ram"
										onChange={handleChange}
										type="text"
										name="ram"
										value={ram}
										validators={['required']}
										errorMessages={['this field is required']}
										variant="outlined"
									/>
									<TextValidator
										className="mb-16 w-100"
										label="OS"
										onChange={handleChange}
										type="text"
										name="os"
										value={os}
										validators={['required']}
										errorMessages={['this field is required']}
										variant="outlined"
									/>
									<TextValidator
										className="mb-16 w-100"
										label="Screen Size"
										onChange={handleChange}
										type="text"
										name="screen_size"
										value={screen_size}
										validators={['required']}
										errorMessages={['this field is required']}
										variant="outlined"
									/>
									<TextValidator
										className="mb-16 w-100"
										label="Battery (mAh)"
										onChange={handleChange}
										type="text"
										name="battery"
										value={battery}
										validators={['required']}
										errorMessages={['this field is required']}
										variant="outlined"
									/>
									<TextValidator
										className="mb-16 w-100"
										label="Memory (GB)"
										onChange={handleChange}
										type="text"
										name="memory"
										value={memory}
										validators={['required']}
										errorMessages={['this field is required']}
										variant="outlined"
									/>
									<TextValidator
										className="mb-16 w-100"
										label="Color"
										onChange={handleChange}
										type="text"
										name="color"
										value={color}
										validators={['required']}
										errorMessages={['this field is required']}
										variant="outlined"
									/>
								</div>
							) : (
								<div>
									{/* <TextValidator
										className="mb-16 w-100"
										label="Description"
										onChange={handleChange}
										type="text"
										name="description"
										value={description}
										validators={['required']}
										errorMessages={['this field is required']}
										variant="outlined"
									/> */}
								</div>
							)}
						</Grid>

						<Grid item lg={6} md={6} sm={12} xs={12}>
							<TextValidator
								className="mb-16 w-100"
								label="Introduction"
								onChange={handleChange}
								type="text"
								name="introduction"
								value={introduction}
								validators={['required']}
								errorMessages={['this field is required']}
								variant="outlined"
								multiline
							/>
							<TextValidator
								className="mb-16 w-100"
								label="Price"
								onChange={handleChange}
								type="number"
								name="price"
								value={price}
								validators={[
									'required',
									// 'minStringLength:16',
									// 'maxStringLength: 16',
								]}
								errorMessages={['this field is required']}
								variant="outlined"
							/>
							<TextValidator
								className="mb-16 w-100"
								label="Quantity"
								onChange={handleChange}
								type="number"
								name="quantity"
								value={quantity}
								validators={[
									'required',
									// 'minStringLength:16',
									// 'maxStringLength: 16',
								]}
								errorMessages={['this field is required']}
								variant="outlined"
							/>
							<div
								style={{
									display: 'flex',
									flexDirection: 'row',
									justifyContent: 'space-between',
								}}
							>
								<InputLabel>Image</InputLabel>

								<ImageUploader
									withIcon={true}
									onChange={onDrop}
									imgExtension={['.jpg', '.gif', '.png', '.gif']}
									maxFileSize={5242880}
								/>
							</div>
							{state.image && !isLoadImage && state.image.length ? (
								<Table>
									<TableHead>
										<TableRow>
											<TableCell>No.</TableCell>
											<TableCell>Image</TableCell>
											<TableCell></TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{state.image.map((v, i) => (
											<TableRow>
												<TableCell
													className="px-0 capitalize"
													align="left"
												>
													{i + 1}
												</TableCell>
												<TableCell
													className="px-0 capitalize"
													align="left"
												>
													<img src={v} width={50} height={50} />
												</TableCell>
												<TableCell
													className="px-0 capitalize"
													align="right"
												>
													<IconButton
														onClick={() => _deleteImg(v)}
													>
														<Icon color="error">close</Icon>
													</IconButton>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (state.image && isLoadImage && state.image.length) ||
							  (isLoadImage &&
									state.image &&
									state.image.length === 0) ? (
								<CircularProgress />
							) : (
								<div />
							)}
						</Grid>
					</Grid>
					<Button color="primary" variant="contained" type="submit">
						<Icon>send</Icon>
						<span className="pl-8 capitalize">Update</span>
					</Button>
				</ValidatorForm>
			</SimpleCard>
		</div>
	);
};

export default UpdateProductForm;
