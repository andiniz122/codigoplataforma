import React, {Component} from 'react';
import axios from 'axios';

import {
	Alert,
	Row,
	Col,
	Card,
	CardHeader,
	CardBody,
	Table,
	Button,
	Input,
	Modal,
	ModalFooter,
	ModalBody,
	ModalHeader,
	Label,
	FormGroup,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	FormFeedback, Form
} from 'reactstrap';

import moment from 'moment';

import {DotLoader} from 'react-spinners';
import ReactDataSheet from 'react-datasheet';
import 'react-datasheet/lib/react-datasheet.css';
import Select from 'react-select';
import 'react-select/dist/react-select.css'
import 'react-virtualized/styles.css'
import 'react-virtualized-select/styles.css'
import VirtualizedSelect from 'react-virtualized-select';
import 'react-select/dist/react-select.css';
import Joyride, {STATUS} from 'react-joyride';
import {Pie, HorizontalBar, Bar} from "react-chartjs-2";

import _ from "lodash";

const TIPO_USUARIO = require('../../data/tipo_usuario');

const options = {
	responsive: true,
	tooltips: {
		mode: 'label'
	},
	elements: {
		line: {
			fill: false
		}
	},
	scales: {
		xAxes: [
			{
				display: true,
				gridLines: {
					display: false
				},
				labels: {
					show: true
				}
			}
		],
		yAxes: [
			{
				type: 'linear',
				display: true,
				position: 'left',
				id: 'y-axis-1',
				gridLines: {
					display: false
				},
				labels: {
					show: true
				}
			},

		]
	}
};

class DashboardDemandaSuperAdmin extends Component {

	constructor (props) {
		super(props);

		this.state = {
			unidades_options: [],
			unidades: '',
			unidade: '',
			demanda_contratada_ponta: '',
			demanda_contratada_fp: '',
			demanda_ponta: '',
			demanda_fp: '',
			periodo_demanda_ponta: '',
			periodo_demanda_fp: '',
			labels: [],
			values_ponta: [],
			values_fp: [],
			colors: [],
			usage_ponta: '',
			usage_fp: '',
			soma: '',
			ok: false,
			nok_message: 'Nenhuma unidade selecionada.',
			show_spinner: false,
		};

		this.handleUnidadeChange = this.handleUnidadeChange.bind(this);
	}

	componentDidMount() {

		const newState = {...this.state};
		newState.show_spinner = true;
		this.setState(newState);

		axios.get('/dashboard-demanda-param-admin')
		.then(response => {
			const newState = {...this.state};
			newState.unidades_options = response.data.unidades;
			newState.show_spinner = false;
			this.setState(newState);
		}).catch(error => {
			if(typeof error.response !== 'undefined') {
				if(error.response.status === 401) {
					localStorage.removeItem('login-data');
					window.location = '/#/login'
				} else if(error.response.status === 500) {
					const newState = {...this.state};
					newState.show_error_notification = true;
					this.setState(newState);
				}
			}
		});

	}

	getColor() {
		return '#' + Math.floor(Math.random()*16777215).toString(16);
	}

	handleUnidadeChange(selectedOption) {

		this.setState({
			unidade: selectedOption,
			show_spinner: true
		});

		axios.get('/dashboard-demanda-admin',{
			params: {
				'id_unidade': selectedOption.id
			}
		})
		.then(response => {
			const newState = {...this.state};
			newState.demanda_contratada_ponta = response.data.demanda_contratada_ponta;
			newState.demanda_contratada_fp = response.data.demanda_contratada_fp;
			newState.labels = response.data.labels;
			newState.values_ponta = response.data.values_ponta;
			newState.values_fp = response.data.values_fp;
			newState.demanda_ponta = response.data.demanda_ponta;
			newState.demanda_fp = response.data.demanda_fp;
			newState.periodo_demanda_ponta = response.data.periodo_demanda_ponta;
			newState.periodo_demanda_fp = response.data.periodo_demanda_fp;
			newState.colors = newState.labels.map(x => this.getColor());
			newState.usage_ponta = response.data.usage_ponta;
			newState.usage_fp = response.data.usage_fp;
			newState.soma = response.data.soma;
			newState.consumo_ponta = response.data.consumo_ponta;
			newState.consumo_fora_ponta = response.data.consumo_fora_ponta;
			newState.consumo_total = response.data.consumo_total;
			newState.ok = response.data.ok;

			if(!newState.ok) {
				newState.nok_message = 'Não existem dados suficientes para esta unidade';
			}
			newState.show_spinner = false;
			this.setState(newState);
		}).catch(error => {
			if(typeof error.response !== 'undefined') {
				if(error.response.status === 401) {
					localStorage.removeItem('login-data');
					window.location = '/#/login'
				} else if(error.response.status === 500) {
					const newState = {...this.state};
					newState.show_error_notification = true;
					this.setState(newState);
				}
			}
		});
	}

	render () {

		let spinner = <div></div>;
		if (this.state.show_spinner) {
			spinner = (
				<div className="spinner-results">
					<DotLoader
						color={'#3AAFB9'}
						loading={true}
					/>
					<label>Carregando...</label>
				</div>
			);
		}

		const data = {
			labels: this.state.labels,
			datasets: [
				{
					label: 'Demanda Contratada FHP',
					type: 'line',
					data: [this.state.demanda_contratada_fp],
					fill: false,
					borderColor: 'lime',
					backgroundColor: 'lime',
					pointBorderColor: 'lime',
					pointBackgroundColor: 'lime',
					pointHoverBackgroundColor: 'lime',
					pointHoverBorderColor: 'lime',
				},{
					label: 'Demanda Ativa fora de Ponta',
					type: 'line',
					data: [this.state.demanda_fp],
					fill: false,
					borderColor: 'cyan',
					backgroundColor: 'cyan',
					pointBorderColor: 'cyan',
					pointBackgroundColor: 'cyan',
					pointHoverBackgroundColor: 'cyan',
					pointHoverBorderColor: 'cyan',
				},{
					label: 'Potência Consumida Fora de Ponta',
					type: 'bar',
					backgroundColor: 'rgba(47, 236, 110,0.2)',
					borderColor: 'rgba(35, 184, 84,1)',
					borderWidth: 1,
					hoverBackgroundColor: 'rgba(35, 184, 84,0.4)',
					hoverBorderColor: 'rgba(24, 125, 57,1)',
					data: this.state.values_fp,
				}
			]
		};

		if(this.state.values_ponta.length > 0) {
			data.datasets.push({
				label: 'Potência Consumida na Ponta',
				type: 'bar',
				backgroundColor: 'rgba(255, 102, 102,0.2)',
				borderColor: 'rgba(204, 0, 0,1)',
				borderWidth: 1,
				hoverBackgroundColor: 'rgba(255, 77, 77,0.4)',
				hoverBorderColor: 'rgba(102, 0, 0,1)',
				data: this.state.values_ponta,
			});
		}

		if(this.state.demanda_ponta !== null && this.state.demanda_ponta !== undefined) {
			data.datasets.push({
				label: 'Demanda Ativa de Ponta',
				type: 'line',
				data: [this.state.demanda_ponta],
				fill: false,
				borderColor: 'blue',
				backgroundColor: 'blue',
				pointBorderColor: 'blue',
				pointBackgroundColor: 'blue',
				pointHoverBackgroundColor: 'blue',
				pointHoverBorderColor: 'blue',
			});
		}

		if(this.state.demanda_contratada_ponta !== null && this.state.demanda_contratada_ponta !== undefined) {
			data.datasets.push({
				label: 'Demanda Contratada HP',
				type: 'line',
				data: [this.state.demanda_contratada_ponta],
				fill: false,
				borderColor: 'green',
				backgroundColor: 'green',
				pointBorderColor: 'green',
				pointBackgroundColor: 'green',
				pointHoverBackgroundColor: 'green',
				pointHoverBorderColor: 'green',
			});
		}

		let plugins = [{
			afterDraw: (chart, easing) => {
				const ctx = chart.chart.ctx;

				const scaleX = chart.scales['x-axis-0'];
				const scaleY = chart.scales['y-axis-0'];

				let Sy = (scaleY.bottom - scaleY.top) / (scaleY.min - scaleY.max);

				let y = 0;
				if(this.state.demanda_ponta !== null && this.state.demanda_ponta !== undefined) {
					y = scaleY.top + (this.state.demanda_ponta - scaleY.end) * Sy;
					ctx.fillStyle = 'blue';
					ctx.strokeStyle = 'blue';
					ctx.save();
					ctx.beginPath();
					ctx.moveTo(scaleX.left, y);
					ctx.lineTo(scaleX.right, y);
					ctx.lineWidth = 2;
					ctx.stroke();
					ctx.restore();
				}

				y = scaleY.top + (this.state.demanda_fp - scaleY.end) * Sy ;
				ctx.fillStyle = 'cyan';
				ctx.strokeStyle = 'cyan';
				ctx.save();
				ctx.beginPath();
				ctx.moveTo(scaleX.left, y);
				ctx.lineTo(scaleX.right, y);
				ctx.lineWidth = 2;
				ctx.stroke();
				ctx.restore();

				if(this.state.demanda_contratada_ponta !== null && this.state.demanda_contratada_ponta !== undefined) {
					ctx.fillStyle = 'green';
					ctx.strokeStyle = 'green';
					y = scaleY.top + (this.state.demanda_contratada_ponta - scaleY.end) * Sy;
					ctx.save();
					ctx.beginPath();
					ctx.moveTo(scaleX.left, y);
					ctx.lineTo(scaleX.right, y);
					ctx.lineWidth = 2;
					ctx.stroke();
					ctx.restore();
				}

				ctx.fillStyle = 'lime';
				ctx.strokeStyle = 'lime';
				y = scaleY.top + (this.state.demanda_contratada_fp - scaleY.end) * Sy;
				ctx.save();
				ctx.beginPath();
				ctx.moveTo(scaleX.left, y);
				ctx.lineTo(scaleX.right, y);
				ctx.lineWidth = 2;
				ctx.stroke();
				ctx.restore();
			}
		}];


		let horario_ponta = moment(new Date(Date.parse(this.state.periodo_demanda_ponta))).format('DD/MM/YYYY HH:mm');
		let horario_fp = moment(new Date(Date.parse(this.state.periodo_demanda_fp))).format('DD/MM/YYYY HH:mm');

		let dashboard = <div>{this.state.nok_message}</div>;
		if(this.state.ok) {
			dashboard = <Row>
				<Col xs="8" sm="8">
					<Bar
						data={data}
						height={500}
						plugins={plugins}
						options={{
							maintainAspectRatio: false,
							legend: {
								position: 'bottom',
								align: 'center',
								fullWidth: false,
								labels: {
									boxWidth: 20,
									padding: 20,
									generateLabels:  function (chart) {

										chart.legend.afterFit = function () {
											var width = this.width;
											console.log(this.width);
											console.log(this);
											this.lineWidths = this.lineWidths.map(function(){return width;});
										};

										var data = chart.data;
										if (data.labels.length && data.datasets.length) {
											return data.datasets.map(function(label, i) {
												var meta = chart.getDatasetMeta(i);
												var style = meta.controller.getStyle(i);

												return {
													text: label.label,
													fillStyle: style.backgroundColor,
													strokeStyle: '',
													lineWidth: style.borderWidth,
													index: i
												};
											});
										}
										return [];
									}
								}
							}
						}}
					/>
				</Col>
				<Col xs="4" sm="4">
					{this.state.demanda_ponta !== undefined && this.state.demanda_ponta !== null &&
					<label>Consumo na Ponta: <b>{this.state.consumo_ponta} kW</b></label>}
					<br/>
					<label>Consumo fora de Ponta: <b>{this.state.consumo_fora_ponta} kW</b></label>
					<br/>
					<label>Consumo Total: <b>{this.state.consumo_total} kW</b></label>
					<br/>
					<br/>
					<br/>
					<label>Demanda Total Contratada FHP: <b>{this.state.demanda_contratada_fp} kW</b></label>
					<br/>
					{this.state.demanda_contratada_ponta !== undefined && this.state.demanda_contratada_ponta !== null &&
					<label>Demanda Total Contratada HP: <b>{this.state.demanda_contratada_ponta} kW</b></label>}
					<br/>
					<br/>
					<br/>
					{this.state.demanda_ponta !== undefined && this.state.demanda_ponta !== null &&
					<label>Demanda Máxima na Ponta: <b>{this.state.demanda_ponta} kW</b></label>}
					<br/>
					{this.state.demanda_ponta !== undefined && this.state.demanda_ponta !== null &&
					<label>Horário da Demanda Máxima na Ponta: <b>{horario_ponta}</b></label>}
					<br/>
					<label>Demanda Máxima fora de Ponta: <b>{this.state.demanda_fp} kW</b></label>
					<br/>
					<label>Horário da Máxima fora de Ponta: <b>{horario_fp}</b></label>
					<br/>
					{this.state.demanda_ponta !== undefined && this.state.demanda_ponta !== null &&
					<label>Percentual de Demanda Utilizada na Ponta: <b>{this.state.usage_ponta}%</b></label>}
					<br/>
					<label>Percentual de Demanda Utilizada Fora de Ponta: <b>{this.state.usage_fp}%</b></label>
				</Col>
			</Row>
		}

		return (
			<div className='dashboard-demanda'>
				{spinner}
				<Card>
					<CardHeader className='item-card-header'>
						Demanda
					</CardHeader>
					<CardBody>
							<label>Selecione a unidade</label>
							<Select
								className='select-unidade'
								options={this.state.unidades_options}
								value={this.state.unidade}
								placeholder="Unidade.."
								onChange={this.handleUnidadeChange}
								multi={false}
							/>
						{dashboard}
					</CardBody>
				</Card>
			</div>
		)
	}
}

export default DashboardDemandaSuperAdmin;
