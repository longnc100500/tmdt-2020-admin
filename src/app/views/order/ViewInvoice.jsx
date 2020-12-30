import React, { Component, useEffect, useRef, useState } from 'react';
import { Breadcrumb, SimpleCard } from 'matx';
import SimpleForm from '../material-kit/forms/AppForm';
import SimpleMenu from '../material-kit/menu/SimpleMenu';
import AppExpansionPanel from '../material-kit/expansion-panel/AppExpansionPanel';
import {
	Table,
	TableHead,
	TableCell,
	TableBody,
	IconButton,
	Icon,
	TableRow,
	Grid,
	TextField,
	Button,
	Select,
	MenuList,
	MenuItem,
} from '@material-ui/core';
import { getNumberWithDot } from 'utils';
import { useDispatch, useSelector } from 'react-redux';
import DetailsTable from 'matx/components/OrderDetailsTable';
import { KeyboardDatePicker, DateTimePicker } from '@material-ui/pickers';
import moment from 'moment';
import { TextValidator, ValidatorForm } from 'react-material-ui-form-validator';
import {
	getOrderList,
	updateOrder,
	updateOrdersRedux,
} from '../../redux/actions/OrderAction';
import MySpinner from 'matx/components/MySpinner';
import { useHistory } from 'react-router-dom';
import MyAlert from 'matx/components/MyAlert';
import ReactToPrint, { useReactToPrint } from 'react-to-print';
import easyinvoice from 'easyinvoice';
import logo from '../../../styles/newLogo6.png';
import axios from 'axios';

const ViewInvoice = ({ data, onEditPress = () => {} }) => {
	console.log('data ne viewInvoice', data);
	const history = useHistory();
	const {
		id = '',
		shipping_address,
		date,
		note,
		payment_method,
		status,
		customer,
		details,
		discount,
	} = data;
	const _handleGoback = () => history.goBack();

	const downloadInvoice = async () => {
		const invoiceData = getInvoiceData();
		const result = await easyinvoice.createInvoice(invoiceData, () => {});

		const invoiceBase64 = result.pdf;
		console.log('base64', invoiceData, result);
		var winparams =
			'dependent=yes,locationbar=no,scrollbars=yes,menubar=yes,' +
			'resizable,screenX=50,screenY=50,width=850,height=1050';
		var htmlPop =
			'<embed width=100% height=100%' +
			' type="application/pdf"' +
			' src="data:application/pdf;base64,' +
			escape(invoiceBase64) +
			'"></embed>';

		var printWindow = window.open('', 'PDF', winparams);
		printWindow.document.write(htmlPop);
		printWindow.print();
	};
	const getInvoiceData = () => {
		return {
			documentTitle: 'HOÁ ĐƠN', //Defaults to INVOICE
			currency: 'VND',
			taxNotation: 'VAT', //or gst
			marginTop: 25,
			marginRight: 25,
			marginLeft: 25,
			marginBottom: 25,
			logo: `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`,
			sender: {
				company: 'Tech World',
				address: 'Đại học sư phạm TP Hồ Chí Minh',
				zip: '1234',
				city: 'Hồ Chí Minh',
				country: 'Việt Nam',
			},
			client: {
				company: 'TechWorld Corp',
				address: '456 An Dương Vương',
				zip: '4567',
				city: 'Hồ Chí Minh',
				country: 'Việt Nam',
			},
			invoiceNumber: `#${id}`,
			invoiceDate: moment().format('YYYY-MM-DD'),
			products: [...getInvoiceProducts()],
			bottomNotice:
				'Cảm ơn quý khách đã tin tưởng sủ dụng dịch vụ của chúng tôi.',
		};
	};
	const getInvoiceProducts = () => {
		let tmp = [...details].map((v) => ({
			quantity: v?.quantity + '',
			description: v?.product?.name,
			tax: 2,
			price: v?.product?.price,
		}));
		return [...tmp];
	};
	return (
		<div>
			<h3>View Invoice</h3>
			<div
				style={{
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'space-between',

					width: '100%',
					marginBottom: 10,
				}}
			>
				<IconButton onClick={_handleGoback}>
					<Icon>arrow_back</Icon>
				</IconButton>
				<div style={{ display: 'flex', flexDirection: 'row' }}>
					<Button
						color="primary"
						variant="contained"
						onClick={() => onEditPress()}
					>
						<span className="pl-8 capitalize">Edit Invoice</span>
					</Button>

					<Button
						onClick={() => {
							downloadInvoice();
						}}
						color="secondary"
						variant="contained"
						className="ml-12"
					>
						<span className="pl-8 capitalize text-center">
							Print Invoice
						</span>
					</Button>
				</div>
			</div>
			<Grid container spacing={6}>
				<Grid item lg={6} md={6} sm={12} xs={12}>
					<SimpleCard>
						<h5 className="mb-16">Customer Info</h5>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'flex-start',
								margin: 0,
								padding: 0,
							}}
						>
							<p style={{ fontWeight: 'bold' }}>Name</p>
							<p>{`${customer?.first_name} ${customer?.last_name}`}</p>
						</div>

						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								margin: 0,
								padding: 0,
							}}
						>
							<p style={{ fontWeight: 'bold' }}>Phone number:</p>
							<p>{`${customer?.phone_number}`}</p>
						</div>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								margin: 0,
								padding: 0,
							}}
						>
							<p style={{ fontWeight: 'bold' }}>Email:</p>
							<p>{customer?.username}</p>
						</div>
					</SimpleCard>
				</Grid>
				<Grid item lg={6} md={6} sm={12} xs={12}>
					<SimpleCard>
						<h5 className="mb-16">Invoice Info</h5>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								margin: 0,
								padding: 0,
							}}
						>
							<p style={{ fontWeight: 'bold' }}>Invoice No.</p>
							<p>#{id}</p>
						</div>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								margin: 0,
								padding: 0,
							}}
						>
							<p style={{ fontWeight: 'bold' }}>Status:</p>
							<p>{status?.value}</p>
						</div>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								margin: 0,
								padding: 0,
							}}
						>
							<p style={{ fontWeight: 'bold' }}>Date:</p>
							<p>{date}</p>
						</div>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								margin: 0,
								padding: 0,
							}}
						>
							<p style={{ fontWeight: 'bold' }}>Payment method:</p>
							<p>{payment_method ? payment_method : 'None'}</p>
						</div>
						<div
							style={{
								display: 'flex',
								justifyContent: 'space-between',
								margin: 0,
								padding: 0,
							}}
						>
							<p style={{ fontWeight: 'bold' }}>Address:</p>
							<p>{shipping_address}</p>
						</div>
					</SimpleCard>
				</Grid>
			</Grid>
			<Grid container spacing={6}>
				<Grid item lg={12} md={12} sm={12} xs={12}>
					<SimpleCard>
						<DetailsTable
							type="view"
							data={details ? details : []}
							discount={discount ? discount : 0}
						/>
					</SimpleCard>
				</Grid>
			</Grid>
		</div>
	);
};
export default ViewInvoice;
