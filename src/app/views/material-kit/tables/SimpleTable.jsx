import React from 'react';

import { useHistory } from 'react-router-dom';

import {
	Table,
	TableHead,
	TableCell,
	TableBody,
	IconButton,
	Icon,
	TableRow,
} from '@material-ui/core';
import MyAlert from 'matx/components/MyAlert';
import {
	deleteProduct,
	updateProductsRedux,
} from 'app/redux/actions/ProductAction';
import { useDispatch, useSelector } from 'react-redux';
import MySpinner from 'matx/components/MySpinner';
import moment from 'moment';
import { getNumberWithDot } from '../../../../utils';
import {
	updateOrdersRedux,
	updateOrderStatus,
} from 'app/redux/actions/OrderAction';
import {
	getAllStatistic,
	updateStatisticDataToRedux,
} from 'app/redux/actions/StatisticAction';

const tableHeading = {
	customer: ['Name', 'Email', 'Address', 'Phone Number', ''],
	product: ['Name', 'Description', 'Inventory', 'Price', ''],
	order: ['Order No.', 'Customer', 'Date', 'Status', 'Method', 'Total', ''],
	contact: ['Message No.', 'Email', 'Phone Number', 'Message', 'Date', ''],
};

const SimpleTable = ({ type, data = [] }) => {
	const history = useHistory();
	const dispatch = useDispatch();
	const { token } = useSelector((state) => state.user);
	const _handleEditCustomerInfo = (info) => {
		history.push('/customer/view-customer', { data: info });
	};
	const _handleEditProduct = (info) => {
		history.push('/product/view-product', { data: info });
	};
	const _handleReplyClick = (message) => {
		history.push('/contact/view-message', { data: message });
	};
	const _handleDeleteProduct = (productId) => {
		MyAlert.show(
			'Warning',
			'Do you want to delete this product ? ',
			true,
			async () => {
				try {
					MySpinner.show();
					const res = await deleteProduct(token, productId);
					console.log('dleete product success', res);
					const newProductList = [...data].filter(
						(v) => v.id !== productId
					);
					updateProductsRedux(dispatch, newProductList);
					MySpinner.hide(() => {}, {
						label: 'Delete Success !',
						value: 0,
					});
				} catch (err) {
					MySpinner.hide(() => {}, {
						label: `Delete Failed ! ${err.message}`,
						value: 1,
					});
					console.log('Delete pRoduct err', err);
				}
			},
			() => console.log('No click ne')
		);
		console.log('product Id ne', productId);
	};
	const _handleOnChangeOrderStatusSuccess = (idx, status) => {
		console.log('new status ne', idx, status);
		const newOrderList = [...data];
		console.log('Old Item', newOrderList?.[idx]);
		const newItem = { ...newOrderList?.[idx], status };
		newOrderList.splice(idx, 1, newItem);
		console.log('new Order List', newOrderList);
		updateOrdersRedux(dispatch, newOrderList);
	};
	return (
		<div className="w-100 overflow-auto p-0">
			<Table style={{ whiteSpace: 'pre' }}>
				<TableHead>
					<TableRow>
						{type === 'customer'
							? tableHeading?.customer?.map((v, i) => (
									<TableCell className="px-0" key={`${i}-${v}`}>
										{v}
									</TableCell>
							  ))
							: type === 'product'
							? tableHeading?.product?.map((v, i) => (
									<TableCell className="px-0" key={`${i}-${v}`}>
										{v}
									</TableCell>
							  ))
							: type === 'contact'
							? tableHeading?.contact?.map((v, i) => (
									<TableCell
										className="px-0"
										key={`${i}-${v}`}
										align="left"
									>
										{v}
									</TableCell>
							  ))
							: tableHeading?.order?.map((v, i) => (
									<TableCell className="px-0" key={`${i}-${v}`}>
										{v}
									</TableCell>
							  ))}
					</TableRow>
				</TableHead>
				<TableBody>
					{type === 'customer'
						? data?.map((item, index) => (
								<TableRow key={index}>
									<TableCell className="px-0 capitalize" align="left">
										{`${item?.first_name} ${item?.last_name}`}
									</TableCell>
									<TableCell className="px-0">
										{`${item?.username}`}
									</TableCell>
									<TableCell className="px-0 capitalize" align="left">
										{`${item?.address}`}
									</TableCell>
									<TableCell className="px-0 capitalize" align="left">
										{`${item?.phone_number}`}
									</TableCell>

									<TableCell className="px-0" align="right">
										<IconButton
											onClick={() => _handleEditCustomerInfo(item)}
										>
											<Icon>create</Icon>
										</IconButton>
										{/* <IconButton>
											<Icon color="error">close</Icon>
										</IconButton> */}
									</TableCell>
								</TableRow>
						  ))
						: type === 'product'
						? data?.map((item, index) => (
								<TableRow key={index}>
									<TableCell className="px-0 capitalize" align="left">
										{item?.name}
									</TableCell>
									<TableCell
										className="px-0 capitalize overflow-hidden pr-5"
										align="left"
									>
										{item?.description?.introduction
											? item?.description?.introduction
											: 'None'}
									</TableCell>
									<TableCell
										className="px-0 pl-20  capitalize"
										align="left"
									>
										<div
											style={{
												padding: 5,
												backgroundColor:
													item?.stock < 5
														? '#FF3D57'
														: item?.stock < 10
														? '#FFAF38'
														: item?.stock < 15
														? '#09B66E'
														: '#09B66E',
												color: 'white',
												borderRadius: 5,
												textAlign: 'center',
												display: 'inline-block',
												fontSize: 10,
											}}
										>
											{`${
												item?.stock > 0
													? 'Available ' + item?.stock + ' item'
													: 'Out of stock'
											}`}
										</div>
									</TableCell>
									<TableCell className="px-0 capitalize">
										{getNumberWithDot(item?.price)}
									</TableCell>
									<TableCell className="px-0" align="right">
										<IconButton
											onClick={() => _handleEditProduct(item)}
										>
											<Icon>create</Icon>
										</IconButton>
										{/* <IconButton
											onClick={() => _handleDeleteProduct(item?.id)}
										>
											<Icon color="error">close</Icon>
										</IconButton> */}
									</TableCell>
								</TableRow>
						  ))
						: type === 'contact'
						? data?.map((v, i) => (
								<TableRow key={`${v?.email}-${v?.phone}-${v.date}`}>
									<TableCell className="px-0" size="small">
										{`#${i}`}
									</TableCell>
									<TableCell className="px-0" align="left">
										<div
											style={{
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												maxHeight: 30,
												display: 'block',
												lineHeight: '1.8em',
												wordWrap: 'break-word',
											}}
										>
											{v?.email}
										</div>
									</TableCell>
									<TableCell className="px-0 capitalize">
										<div
											style={{
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												maxHeight: 30,
												display: 'block',
												lineHeight: '1.8em',
												wordWrap: 'break-word',
											}}
										>
											{v?.phone}
										</div>
									</TableCell>

									<TableCell className="px-0 pr-5" align="left">
										<div
											style={{
												overflow: 'hidden',
												textOverflow: 'ellipsis',
												maxHeight: 30,
												display: 'block',
												lineHeight: '1.8em',
												wordWrap: 'break-word',
											}}
										>
											{v?.message}
										</div>
									</TableCell>
									<TableCell
										className="px-0 capitalize"
										size="small"
										align="left"
									>
										{v?.date
											? moment(v?.date).format('YYYY-MM-DD HH:mm:SS')
											: moment().format('YYYY-MM-DD HH:mm:SS')}
									</TableCell>
									<TableCell
										className="px-0 capitalize"
										size="small"
										align="right"
									>
										<IconButton
											onClick={() => _handleReplyClick(v)}
											disabled={v?.reply}
										>
											<Icon
												style={{
													color: !v?.reply ? '#09B66E' : '#625E80',
												}}
											>
												reply
											</Icon>
										</IconButton>
									</TableCell>
								</TableRow>
						  ))
						: data?.map((item, i) => (
								<TableRow key={`${item?.id}-${item?.total}`}>
									<TableCell className="px-0 capitalize" align="left">
										{item?.id}
									</TableCell>
									<TableCell className="px-0 capitalize" align="left">
										{`${item?.customer?.first_name} ${item?.customer?.last_name}`}
									</TableCell>
									<TableCell className="px-0 capitalize" align="left">
										{`${moment(item?.date).format('YYYY-MM-DD')}`}
									</TableCell>
									<TableCell className="px-0 capitalize" align="left">
										<div
											style={{
												padding: 5,
												backgroundColor:
													item?.status?.id === 1
														? '#FFAF38'
														: item?.status?.id === 2
														? '#FFAF38'
														: item?.status?.id === 3
														? '#09B66E'
														: '#FF3D57',
												color:
													item?.status?.id * 1 <= 2
														? 'black'
														: 'white',
												borderRadius: 5,
												textAlign: 'center',
												display: 'inline-block',
												fontSize: 10,
											}}
										>
											{item?.status?.value}
										</div>
									</TableCell>
									<TableCell className="px-0 capitalize">
										{item?.paymentMethod
											? item?.paymentMethod
											: 'None'}
									</TableCell>
									<TableCell className="px-0 capitalize">
										{getNumberWithDot(
											item?.details?.reduce(
												(x, y) =>
													(x += y.quantity * y.current_price),
												0
											)
										)}
									</TableCell>
									<TableCell className="px-0" align="right">
										<GroupButton
											orderId={item?.id}
											token={token}
											onChangeStatusSuccessFunc={(i, status) =>
												_handleOnChangeOrderStatusSuccess(i, status)
											}
											index={i}
										/>
									</TableCell>
								</TableRow>
						  ))}
				</TableBody>
			</Table>
		</div>
	);
};

const GroupButton = ({ token, orderId, onChangeStatusSuccessFunc, index }) => {
	const history = useHistory();
	const dispatch = useDispatch();
	const _handleViewOrderClick = () => {
		history.push('/order/view-order', { orderId: orderId ? orderId : 1 });
	};
	const _handleChangeOrderStatus = async (status) => {
		try {
			MySpinner.show();

			const formData = new FormData();
			formData.append('StatusId', status);

			const res = await updateOrderStatus(token, formData, orderId);
			console.log('change status res', res);
			const newStatus = {
				id: status,
				value: status === 3 ? 'Th??nh c??ng' : '???? hu???',
			};
			onChangeStatusSuccessFunc(index, newStatus);
			const { sales, customers, circle, product } = await getAllStatistic(
				token
			);
			console.log('init data ne', sales, customers, circle, product);
			updateStatisticDataToRedux(
				dispatch,
				sales,
				product,
				customers,
				circle
			);
			MySpinner.hide(() => {}, { label: 'Change status success', value: 0 });
		} catch (err) {
			console.log('change status err', err);
			MySpinner.hide(() => {}, {
				label: 'Change status failed',
				value: 1,
			});
		}
	};
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'row',
				justifyContent: 'space-around',
			}}
		>
			<IconButton
				onClick={() =>
					MyAlert.show(
						'Warning',
						`Do you want to change this order's status ?`,
						true,
						() => _handleChangeOrderStatus(3),
						() => {}
					)
				}
			>
				<Icon style={{ color: '#09B66E' }}>check</Icon>
			</IconButton>
			<IconButton
				onClick={() =>
					MyAlert.show(
						'Warning',
						`Do you want to change this order's status ?`,
						true,
						() => _handleChangeOrderStatus(4),
						() => {}
					)
				}
			>
				<Icon color="error">close</Icon>
			</IconButton>
			<IconButton onClick={_handleViewOrderClick}>
				<Icon>arrow_right_alt</Icon>
			</IconButton>
		</div>
	);
};

export default SimpleTable;
