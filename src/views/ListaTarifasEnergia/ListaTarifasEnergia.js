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

const TARIFA = require('../../data/tarifa');

class ListaTarifasEnergia extends Component {

	constructor (props) {
		super(props);

		let params = '';

		if (props.location) {
			params = getJsonFromUrl(props.location.search);
		}

		let now = new Date();
		now.setHours(0,0,0,0);

		this.state = {
			nome: '',
			startDate: now,
			endDate: now,
			taxas: {
				'T1': 0
			},
			taxas_demanda: {
				'T1': 0
			},
			is_editing_consumo: '',
			show_modal_taxa: false,
			editing_taxa_modal: false,
			editing_taxa_selected: '',
			taxa_valor_modal: '',
			taxa_demanda_excedende_ponta: '',
			taxa_demanda_excedende_fp: '',
			enabled_salvar_modal: false,
			novo_valor_invalido: false,
			id_unidade: params.id_unidade,
			id_tarifa: params.id_tarifa,
			colors: {
				'T1': 'gray-200',
				'T2': 'gray-500',
				'T3': 'gray-600',
				'T4': 'gray-700',
				'T5': 'gray-800',
				'T6': 'gray-900'
			},
			grid: TARIFA.TARIFA.grid,
			show_spinner: false,
			show_notification: false,
			show_notification_erro_periodo: false,
			show_notification_tarifa: false
		};

		this.salvar = this.salvar.bind(this);
		this.handleStartChange = this.handleStartChange.bind(this);
		this.handleEndChange = this.handleEndChange.bind(this);
		this.novaTaxa = this.novaTaxa.bind(this);
		this.salvarNovaTaxa = this.salvarNovaTaxa.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.updateInputValueModal = this.updateInputValueModal.bind(this);
		this.handleUpdateCell = this.handleUpdateCell.bind(this);
		this.handleEditTarifaConsumo = this.handleEditTarifaConsumo.bind(this);
		this.handleEditTarifaDemanda = this.handleEditTarifaDemanda.bind(this);
		this.updateInputValueNome = this.updateInputValueNome.bind(this);
		this.handleImpostoChange = this.handleImpostoChange.bind(this);
		this.handleIluminacaoChange = this.handleIluminacaoChange.bind(this);
		this.updateInputDemandaExcedentePonta = this.updateInputDemandaExcedentePonta.bind(this);
		this.updateInputDemandaExcedenteFp = this.updateInputDemandaExcedenteFp.bind(this);
		this.handleOutrosChange = this.handleOutrosChange.bind(this);
	}

	componentDidMount() {

		if(this.state.id_tarifa !== '') {

			const newState = {...this.state};
			newState.show_spinner = true;
			this.setState(newState);

			axios.get('/tarifa-energia', {
				params: {
					'id_tarifa': this.state.id_tarifa
				}
			})
				.then(response => {
					let {data} = response;
					const newState = {...this.state};
					newState.id_tarifa = data.id;
					newState.nome = data.nome;
					newState.grid = data.horario_ponta;
					newState.taxas = data.valor_tarifa;

					if (data.valor_tarifa_demanda !== null && data.valor_tarifa_demanda !== undefined) {
						newState.taxas_demanda = data.valor_tarifa_demanda;
					}
					newState.startDate = new Date(data.periodo_inicio);
					newState.endDate = new Date(data.periodo_fim);
					newState.taxa_demanda_excedende_ponta = data.taxa_demanda_excedende_ponta;
					newState.taxa_demanda_excedende_fp = data.taxa_demanda_excedende_fp;
					newState.imposto = data.imposto;
					newState.iluminacao = data.iluminacao;
					newState.outros = data.outros;
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

		const params = new URLSearchParams();
		params.append('json_horarios', JSON.stringify(this.state.grid));
		params.append('json_taxas_consumo', JSON.stringify(this.state.taxas));
		params.append('json_taxas_demanda', JSON.stringify(this.state.taxas_demanda));
		params.append('id_unidade', this.state.id_unidade);
		params.append('nome', this.state.nome);
		params.append('taxa_demanda_excedende_ponta', this.state.taxa_demanda_excedende_ponta !== null ? this.state.taxa_demanda_excedende_ponta : '');
		params.append('taxa_demanda_excedende_fp', this.state.taxa_demanda_excedende_fp !== null ? this.state.taxa_demanda_excedende_fp : '');
		params.append('periodo_inicio', JSON.stringify(this.state.startDate));
		params.append('periodo_fim', JSON.stringify(this.state.endDate));
		params.append('imposto', this.state.imposto);
		params.append('iluminacao', this.state.iluminacao);
		params.append('outros', this.state.outros);

		const newState = {...this.state};
		newState.show_spinner = true;
		this.setState(newState);

		if(this.state.id_tarifa === '') {
			axios.post('/tarifa-energia', params)
				.then(response => {

					let {data} = response;
					const newState = {...this.state};

					newState.id_tarifa = data.id;
					newState.grid = data.horario_ponta;
					newState.taxas = data.valor_tarifa;
					newState.taxas_demanda = data.valor_tarifa_demanda;
					newState.startDate = new Date(data.periodo_inicio);
					newState.endDate = new Date(data.periodo_fim);
					newState.imposto = data.imposto;
					newState.iluminacao = data.iluminacao;
					newState.outros = data.outros;
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

			axios.put('/tarifa-energia', params)
				.then(response => {

					let {data} = response;
					const newState = {...this.state};

					newState.id_tarifa = data.id;
					newState.grid = data.horario_ponta;
					newState.taxas = data.valor_tarifa;
					newState.taxas_demanda = data.valor_tarifa_demanda;
					newState.startDate = new Date(data.periodo_inicio);
					newState.endDate = new Date(data.periodo_fim);
					newState.imposto = data.imposto;
					newState.iluminacao = data.iluminacao;
					newState.outros = data.outros;
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

	novaTaxa(is_editing_consumo) {
		const newState = {...this.state};
		newState.show_modal_taxa = true;
		newState.is_editing_consumo = is_editing_consumo;
		newState.editing_taxa_modal = false;
		this.setState(newState);
	}

	updateInputValueModal(event) {

		let valor = event.target.value;

		this.setState({
			taxa_valor_modal: valor,
			enabled_salvar_modal: valor.length > 0
		});
	}

	updateInputValueNome(event) {
		this.setState({
			nome: event.target.value,
		});
	}

	salvarNovaTaxa() {
		const newState = {...this.state};

		if(isNaN(newState.taxa_valor_modal)) {
			newState.novo_valor_invalido = true;
		} else if(!this.state.editing_taxa_modal){
			if(newState.is_editing_consumo) {
				let newKey = 'T' + (Object.keys(newState.taxas).length + 1);
				newState.taxas[newKey] = newState.taxa_valor_modal;
			} else {
				let newKey = 'T' + (Object.keys(newState.taxas_demanda).length + 1);
				newState.taxas_demanda[newKey] = newState.taxa_valor_modal;
			}
			newState.show_modal_taxa = false;
			newState.novo_valor_invalido = false;
			newState.taxa_valor_modal = '';
		} else {
			if(newState.is_editing_consumo) {
				newState.taxas[newState.editing_taxa_selected] = newState.taxa_valor_modal;
			} else {
				newState.taxas_demanda[newState.editing_taxa_selected] = newState.taxa_valor_modal;
			}

			newState.show_modal_taxa = false;
			newState.novo_valor_invalido = false;
			newState.taxa_valor_modal = '';
		}

		this.setState(newState);
	}

	closeModal() {
		const newState = {...this.state};
		newState.show_modal_taxa = false;
		newState.novo_valor_invalido = false;
		this.setState(newState);
	}

	handleUpdateCell(cell, row, col, value) {
		const newState = {...this.state};

		if (!Object.keys(this.state.taxas).includes(value) && !Object.keys(this.state.taxas_demanda).includes(value)) {
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

	handleImpostoChange(event) {
		this.setState({
			imposto: event.target.value,
		});
	}

	handleIluminacaoChange(event) {
		this.setState({
			iluminacao: event.target.value,
		});
	}

	handleOutrosChange(event) {
		this.setState({
			outros: event.target.value,
		});
	}

	updateInputDemandaExcedentePonta(event) {
		this.setState({
			taxa_demanda_excedende_ponta: event.target.value,
		});
	}

	updateInputDemandaExcedenteFp(event) {
		this.setState({
			taxa_demanda_excedende_fp: event.target.value,
		});
	}

	handleEditTarifaConsumo(taxa) {

		const newState = {...this.state};
		newState.show_modal_taxa = true;
		newState.editing_taxa_modal = true;
		newState.is_editing_consumo = true;
		newState.editing_taxa_selected = taxa;

		newState.taxa_valor_modal = this.state.taxas[taxa];
		this.setState(newState);
	}

	handleEditTarifaDemanda(taxa) {

		const newState = {...this.state};
		newState.show_modal_taxa = true;
		newState.editing_taxa_modal = true;
		newState.is_editing_consumo = false;
		newState.editing_taxa_selected = taxa;

		newState.taxa_valor_modal = this.state.taxas_demanda[taxa];
		this.setState(newState);
	}

	render () {

		let {taxas, taxas_demanda} = this.state;

		let tags_taxa_consumo = Object.keys(taxas).map(taxa => {
			let valor = taxas[taxa];
			let class_name = this.state.colors[taxa];
			return (
				<div className='group-taxa' onClick={this.handleEditTarifaConsumo.bind(this, taxa)}>
					<div className={'taxa-name ' + class_name}>{taxa}</div><span> : {valor} R$/kWh</span>
				</div>
			)
		});

		let tags_taxa_demanda = Object.keys(taxas_demanda).map(taxa => {
			let valor = taxas_demanda[taxa];
			let class_name = this.state.colors[taxa];
			return (
				<div className='group-taxa' onClick={this.handleEditTarifaDemanda.bind(this, taxa)}>
					<div className={'taxa-name ' + class_name}>{taxa}</div><span> : {valor} R$/kW</span>
				</div>
			)
		});

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
				<Modal isOpen={this.state.show_modal_taxa} className='modal-lotes'>
					<ModalHeader>Taxa</ModalHeader>
					<ModalBody>
						<Label>Valor</Label>
						<Input invalid={this.state.novo_valor_invalido} type="text" placeholder="Valor" value={this.state.taxa_valor_modal} onChange={this.updateInputValueModal}/>
						<FormFeedback>Digite um número válido. Use o ponto como separador decimal.</FormFeedback>
					</ModalBody>
					<ModalFooter>
						<Button id='historico-button' disabled={!this.state.enabled_salvar_modal} className='salvar-button' color="success" onClick={this.salvarNovaTaxa.bind(this, null)}>Salvar</Button>
						<Button color="primary" onClick={this.closeModal.bind(this, null)}>Fechar</Button>{' '}
					</ModalFooter>
				</Modal>
				<Card>
					<CardHeader className='item-card-header'>
						Tarifa de Energia
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
								<Label htmlFor="cnpj">Taxas de Consumo</Label>
								<br/>
								{tags_taxa_consumo}
								<br></br>
								<Button id='historico-button' className='salvar-button' color="primary" onClick={this.novaTaxa.bind(this, true)}>Adicionar Taxa de Consumo</Button>
								<div className='separator'></div>
								<Label htmlFor="cnpj">Taxas de Demanda</Label>
								<br/>
								{tags_taxa_demanda}
								<br></br>
								<Button id='historico-button' className='salvar-button' color="primary" onClick={this.novaTaxa.bind(this, false)}>Adicionar Taxa de Demanda</Button>
								<div className='separator'></div>
								<br/>
								<Label>Taxas/Impostos (%)</Label>
								<Input type="number" placeholder="Valor do imposto.." value={this.state.imposto} onChange={this.handleImpostoChange}/>
								<br/>
								<Label>Demanda Ultrap. FP (R$/Kw)</Label>
								<Input type="number" placeholder="Taxa de Demanda FP" value={this.state.taxa_demanda_excedende_fp} onChange={this.updateInputDemandaExcedenteFp}/>
								<br/>
								<Label>Demanda Ultrap. Ponta (R$/Kw)</Label>
								<Input type="number" placeholder="Taxa de Demanda na ponta" value={this.state.taxa_demanda_excedende_ponta} onChange={this.updateInputDemandaExcedentePonta}/>
								<br/>
								<Label>Valor da Taxa de Iluminação Pública</Label>
								<Input type="number" placeholder="Valor da taxa de iluminação.." value={this.state.iluminacao} onChange={this.handleIluminacaoChange}/>
								<br/>
								<Label>Outros</Label>
								<Input type="number" placeholder="Outras taxas.." value={this.state.outros} onChange={this.handleOutrosChange}/>
								<Button id='historico-button' className='salvar-button' color="success" onClick={this.salvar.bind(this, null)}>Salvar</Button>
							</Col>
							<Col xs="8" sm="8">
								<ReactDataSheet
									data={this.state.grid}
									valueRenderer={(cell) => cell.value}
									onContextMenu={(e, cell, i, j) => cell.readOnly ? e.preventDefault() : null}
									onCellsChanged={changes => {
										const grid = this.state.grid.map(row => [...row]);
										changes.forEach(({cell, row, col, value}) => {
											// grid[row][col] = {...grid[row][col], value};
											this.handleUpdateCell(cell, row, col, value);
										});
										this.setState({grid})
									}}
								/>
							</Col>
						</Row>
					</CardBody>
				</Card>

			</div>
		)
	}
}

export default ListaTarifasEnergia;
