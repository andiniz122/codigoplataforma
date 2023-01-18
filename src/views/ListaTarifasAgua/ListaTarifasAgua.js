import React, {Component} from 'react';
import axios from 'axios';

import {
	Row,
	Col,
	Card,
	CardHeader,
	CardBody,
	Table,
	Button, FormGroup, Label, Input, UncontrolledAlert,
	Modal, ModalFooter, ModalBody, ModalHeader, FormFeedback, InputGroup, Alert
} from 'reactstrap';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';

import ReactDataSheet from 'react-datasheet';
import 'react-datasheet/lib/react-datasheet.css';
import Select from 'react-select';
import 'react-select/dist/react-select.css'
import 'react-virtualized/styles.css'
import 'react-virtualized-select/styles.css'
import VirtualizedSelect from 'react-virtualized-select';
import 'react-select/dist/react-select.css';
import {getJsonFromUrl} from "../../index";
import {DotLoader} from "react-spinners";

const TARIFA = require('../../data/tarifa_agua');

class ListaTarifasAgua extends Component {

	constructor (props) {
		super(props);

		let params = '';

		if (props.location) {
			params = getJsonFromUrl(props.location.search);
		}

		this.state = {
			nome: '',
			startDate: new Date(),
			endDate: new Date(),
			taxa: '',
			imposto: '',
			novo_valor_invalido: false,
			id_unidade: params.id_unidade,
			id_tarifa: params.id_tarifa,
			show_spinner: false,
			show_notification: false,
			show_notification_erro_periodo: false,
			show_notification_tarifa: false
		};

		this.salvar = this.salvar.bind(this);
		this.handleStartChange = this.handleStartChange.bind(this);
		this.handleEndChange = this.handleEndChange.bind(this);
		this.handleImpostoChange = this.handleImpostoChange.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.updateInputValueModal = this.updateInputValueModal.bind(this);
		this.handleUpdateCell = this.handleUpdateCell.bind(this);
		this.updateInputValueNome = this.updateInputValueNome.bind(this);
	}

	componentDidMount() {

		if(this.state.id_tarifa !== '') {

			const newState = {...this.state};
			newState.show_spinner = true;
			this.setState(newState);

			axios.get('/tarifa-agua', {
				params: {
					'id_tarifa': this.state.id_tarifa
				}
			})
				.then(response => {
					let {data} = response;
					const newState = {...this.state};
					newState.id_tarifa = data.id;
					newState.nome = data.nome;
					newState.taxa = data.valor_tarifa;
					newState.startDate = new Date(data.periodo_inicio);
					newState.endDate = new Date(data.periodo_fim);
					newState.imposto = data.imposto;
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

	}

	salvar() {

		const newState = {...this.state};

		if(isNaN(newState.taxa)) {
			newState.novo_valor_invalido = true;
			this.setState(newState);
			return;
		}

		const params = new URLSearchParams();
		params.append('taxa', this.state.taxa);
		params.append('imposto', this.state.imposto);
		params.append('id_unidade', this.state.id_unidade);
		params.append('nome', this.state.nome);
		params.append('periodo_inicio', JSON.stringify(this.state.startDate));
		params.append('periodo_fim', JSON.stringify(this.state.endDate));
		params.append('json_horarios', JSON.stringify(TARIFA.TARIFA.grid));

		newState.show_spinner = true;
		this.setState(newState);

		if(this.state.id_tarifa === '') {
			axios.post('/tarifa-agua', params)
				.then(response => {

					let {data} = response;
					const newState = {...this.state};

					newState.id_tarifa = data.id;
					newState.taxa = data.valor_tarifa;
					newState.startDate = new Date(data.periodo_inicio);
					newState.endDate = new Date(data.periodo_fim);
					newState.imposto = data.imposto;
					newState.show_spinner = false;

					newState.show_notification = true;
					this.setState(newState);

					setTimeout(function () {
						const newState = {...this.state};
						newState.show_notification = false;
						this.setState(newState);
					}.bind(this), 2000)
				}).catch(error => {
				if(typeof error.response !== 'undefined') {
					if(error.response.status === 401) {
						localStorage.removeItem('login-data');
						window.location = '/#/login'
					} else if(error.response.status === 400) {
						const newState = {...this.state};
						newState.show_notification_erro_periodo = true;
						newState.show_spinner = false;
						this.setState(newState);

						setTimeout(function () {
							const newState = {...this.state};
							newState.show_notification_erro_periodo = false;
							this.setState(newState);
						}.bind(this), 2000)
					} else if(error.response.status === 500) {
						const newState = {...this.state};
						newState.show_error_notification = true;
						this.setState(newState);
					}
				}
			});
		} else {
			params.append('id_tarifa', JSON.stringify(this.state.id_tarifa));

			axios.put('/tarifa-agua', params)
				.then(response => {

					let {data} = response;
					const newState = {...this.state};

					newState.id_tarifa = data.id;
					newState.grid = data.horario_ponta;
					newState.taxas = data.valor_tarifa;
					newState.startDate = new Date(data.periodo_inicio);
					newState.endDate = new Date(data.periodo_fim);
					newState.imposto = data.imposto;
					newState.show_spinner = false;

					newState.show_notification = true;
					this.setState(newState);

					setTimeout(function () {
						const newState = {...this.state};
						newState.show_notification = false;
						this.setState(newState);
					}.bind(this), 2000)
				}).catch(error => {
				if(typeof error.response !== 'undefined') {
					if(error.response.status === 401) {
						localStorage.removeItem('login-data');
						window.location = '/#/login'
					} else if(error.response.status === 400) {
						const newState = {...this.state};
						newState.show_notification_erro_periodo = true;
						newState.show_spinner = false;
						this.setState(newState);

						setTimeout(function () {
							const newState = {...this.state};
							newState.show_notification_erro_periodo = false;
							this.setState(newState);
						}.bind(this), 2000)
					} else if(error.response.status === 500) {
						const newState = {...this.state};
						newState.show_error_notification = true;
						this.setState(newState);
					}
				}
			});
		}


	}

	handleStartChange(event) {
		const newState = {...this.state};
		newState.startDate = new Date(event.setHours(0,0,0,0));
		this.setState(newState);
	}

	handleEndChange(event) {
		const newState = {...this.state};
		newState.endDate = new Date(event.setHours(0,0,0,0));
		this.setState(newState);
	}

	updateInputValueModal(event) {

		let valor = event.target.value;

		this.setState({
			taxa: valor,
			enabled_salvar_modal: valor.length > 0
		});
	}

	handleImpostoChange(event) {
		this.setState({
			imposto: event.target.value,
		});
	}

	updateInputValueNome(event) {
		this.setState({
			nome: event.target.value,
		});
	}

	closeModal() {
		const newState = {...this.state};
		newState.show_modal_taxa = false;
		newState.novo_valor_invalido = false;
		this.setState(newState);
	}

	handleUpdateCell(cell, row, col, value) {
		const newState = {...this.state};

		if (!Object.keys(this.state.taxas).includes(value)) {
			newState.show_notification_tarifa = true;

			setTimeout(function() {
				const newState = {...this.state};
				newState.show_notification_tarifa = false;
				this.setState(newState);
			}.bind(this), 2000);
		} else {
			cell['value'] = value;
			cell['className'] = newState.colors[value];
			newState.grid[row][col] = cell;
		}

		this.setState(newState);
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

		return (
			<div className='lista-tarifas'>
				<Alert isOpen={this.state.show_notification} color="success" fade={true}>
					Salvo com sucesso!
				</Alert>
				<Alert isOpen={this.state.show_notification_erro_periodo} color="danger" fade={true}>
					Já existe uma tarifa neste período!
				</Alert>
				<Alert isOpen={this.state.show_notification_tarifa} color="danger" fade={true}>
					Valor de tarifa inválido!
				</Alert>
				{spinner}
				<Card>
					<CardHeader className='item-card-header'>
						Tarifa de Água
					</CardHeader>
					<CardBody>
						<Row>
							<Col xs="4" sm="4">
								<FormGroup>
									<Label htmlFor="cnpj">Nome</Label>
									<Input
										value={this.state.nome}
										onChange={this.updateInputValueNome}
										placeholder="Digite o nome da tarifa" />
								</FormGroup>
								<FormGroup>
									<Label htmlFor="cnpj">Válida desde</Label>
									<br></br>
									<DatePicker
										selected={this.state.startDate}
										onChange={this.handleStartChange}
										dateFormat="dd/MM/yyyy"
									/>
								</FormGroup>
								<FormGroup>
									<Label htmlFor="cnpj">Até</Label>
									<br></br>
									<DatePicker
										selected={this.state.endDate}
										onChange={this.handleEndChange}
										dateFormat="dd/MM/yyyy"
									/>
								</FormGroup>
								<div className='separator'></div>
								<Label>Valor da Taxa de Água</Label>
								<Input invalid={this.state.novo_valor_invalido} type="number" placeholder="Valor do m³" value={this.state.taxa} onChange={this.updateInputValueModal}/>
								<FormFeedback>Digite um número válido. Use o ponto como separador decimal.</FormFeedback>
								<br/>
								<Label>Taxas/Impostos (%)</Label>
								<Input type="number" placeholder="Valor do imposto.." value={this.state.imposto} onChange={this.handleImpostoChange}/>
								<Button id='historico-button' className='salvar-button' color="success" onClick={this.salvar.bind(this, null)}>Salvar</Button>
							</Col>
						</Row>
					</CardBody>
				</Card>

			</div>
		)
	}
}

export default ListaTarifasAgua;
