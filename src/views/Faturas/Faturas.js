import React, {Component} from 'react';
import axios from 'axios';

import {
	Alert,
	Row,
	Col,
	Card,
	CardHeader,
	CardBody,
	Collapse,
	Table,
	Button, FormGroup, Label, Input, UncontrolledAlert,
	Modal, ModalFooter, ModalBody, ModalHeader,
	ListGroup,
	ListGroupItem
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

import { Grid as FlexGrid, Row as FlexRow, Col as FlexCol } from 'react-flexbox-grid';


import _ from 'lodash';

import TreeViewMenu from 'react-simple-tree-menu';

import 'react-simple-tree-menu/dist/main.css';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DEFAULT_PADDING = 16;
const ICON_SIZE = 12;
const LEVEL_SPACE = 16;

const ToggleIcon = ({ on }) => <span style={{ marginRight: 8 }}>{on ? '-' : '+'}</span>;


const ListItem = ({
					  level = 0,
					  hasNodes,
					  isOpen,
					  label,
					  icon,
					  type,
					  organizacao_id,
					  unidade_id,
					  medidor_id,
					  searchTerm,
					  openNodes,
					  toggleNode,
					  matchSearch,
					  focused,
					  ...props
				  }) => (
	<ListGroupItem
		{...props}
		style={{
			paddingLeft: DEFAULT_PADDING + ICON_SIZE + level * LEVEL_SPACE,
			cursor: 'pointer',
			boxShadow: focused ? '0px 0px 5px 0px #222' : 'none',
			zIndex: focused ? 999 : 'unset',
			position: 'relative',
		}}
	>
		{hasNodes && (
			<div
				style={{ display: 'inline-block' }}
				onClick={e => {
					hasNodes && toggleNode && toggleNode();
					e.stopPropagation();
				}}>
				<ToggleIcon on={isOpen} />
			</div>
		)}
		<i className={icon}></i>
		{label}
	</ListGroupItem>
);

class Faturas extends Component {

	constructor (props) {
		super(props);

		this.state = {
			show_spinner: false,
			show_error_notification: false,
			date: new Date(),
			faturas: {},
			unidade_id: '',
			treeData: {}
		};

		this.update = this.update.bind(this);
		this.handleDateChange = this.handleDateChange.bind(this);
		this.gerarPDF = this.gerarPDF.bind(this);
	}

	create_nodes(organizacoes) {

		let nodes = {};

		for (var k = 0, lenk = organizacoes.length; k < lenk; k++) {

			let nodes_unidade = {};

			let organizacao = organizacoes[k];

			let unidades = organizacao.unidades;

			for (var i = 0, len = unidades.length; i < len; i++) {
				let unidade = unidades[i];

				let node_unidade = {
					label: unidade.nome,
					index: i,
					type: 'unidade',
					icon: 'fas fa-building',
					unidade_id: unidade.id,
					nodes: {}
				};

				nodes_unidade[unidade.nome] = node_unidade;
			}

			let nome = organizacao.nome;

			nodes[nome] = {
				label: nome,
				organizacao_id: organizacao.id_organizacao,
				icon: 'fas fa-sitemap',
				type: 'organizacao',
				index: 0,
				nodes: nodes_unidade,
			};
		}

		return nodes;
	}

	componentDidMount() {

		const newState = {...this.state};

		newState.show_spinner = true;
		this.setState(newState);

		let url = `/lista-organizacao`;

		axios.get(url)
			.then(response => {
				const newState = {...this.state};
				newState.show_spinner = false;
				let organizacoes = response.data.organizacoes;
				newState.organizacoes = organizacoes;
				newState.treeData = this.create_nodes(organizacoes);
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

	update(props) {

		const newState = {...this.state};

		let unidade_clicked = props.type === 'unidade';

		if(unidade_clicked) {
			newState.unidade_id = props.unidade_id;
		}

		this.setState(newState);
	}

	handleDateChange(event) {

		if(this.state.unidade_id === '') {
			const newState = {...this.state};
			newState.show_error_notification = true;
			this.setState(newState);

			setTimeout(function() {
				const newState = {...this.state};
				newState.show_error_notification = false;
				this.setState(newState);
			}.bind(this), 2000)
		} else {
			const newState = {...this.state};
			newState.date = event;
			this.setState(newState, () => {
				const newState = {...this.state};
				newState.show_spinner = true;
				this.setState(newState);

				let url = `/fatura`;

				axios.get(url, {
					params: {
						'date': this.state.date,
						'unidade_id': this.state.unidade_id,
					}
				})
					.then(response => {
						const newState = {...this.state};
						newState.show_spinner = false;
						newState.faturas = response.data.custo;

						newState.faturas.forEach(function (item) {
							item.expand_open = false;
						});
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
			});
		}
	}

	toggle(item) {

		const newState = {...this.state};

		newState.faturas.forEach(fatura => {

			if(item.identificador === fatura.identificador) {
				fatura.expand_open = !fatura.expand_open;
				this.setState(newState);
			}
		});
	}

	gerarPDF(item) {

		const newState = {...this.state};
		newState.show_spinner = true;
		this.setState(newState);

		const params = new URLSearchParams();
		params.append('id_fatura', item.id);

		axios.post('/gerar-pdf', params)
			.then(response => {

				const newState = {...this.state};
				newState.show_spinner = false;
				this.setState(newState);

				if(response.data.ok) {
					window.open(response.data.link_fatura, '_blank');
				}
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

		let leituras_list = [];
		if (this.state.faturas !== undefined && this.state.faturas.length > 0) {
			leituras_list = this.state.faturas.map(item => {
				return (
					<React.Fragment>
						<ListGroupItem className='list-item'>
							<div className='list-cell'>{item.nome}</div>
							<div className='list-cell'>{item.consumo}</div>
							<div className='list-cell'>{item.total}</div>
							<div className='list-cell list-cell-buttons'>
								<Button color="primary" onClick={this.toggle.bind(this, item)}><i className="fas fa-search-plus"></i>Visualizar</Button>
								<Button color="success" onClick={this.gerarPDF.bind(this, item)}><i className="fas fa-download"></i>Gerar PDF</Button>
							</div>
						</ListGroupItem>
						<ListGroupItem className='list-item-hidden'>
							<Collapse isOpen={item.expand_open}>
								<Card>
									<CardBody>
										<FlexGrid fluid>
											<FlexRow>
												<FlexCol xs={6} md={4} className="col-title">
													<strong>Identificador</strong>
												</FlexCol>
												<FlexCol xs={6} md={6} className='col-padding'>
													{item.identificador}
												</FlexCol>
											</FlexRow>
											<FlexRow>
												<FlexCol xs={6} md={4} className="col-title">
													<strong>Consumo na Ponta</strong>
												</FlexCol>
												<FlexCol xs={6} md={2} className='col-padding'>
													{item.consumo_ponta} Kwh
												</FlexCol>
												<FlexCol xs={6} md={4} className="col-title">
													<strong>Imposto</strong>
												</FlexCol>
												<FlexCol xs={6} md={2} className='col-padding'>
													R$ {item.imposto}
												</FlexCol>
											</FlexRow>
											<FlexRow>
												<FlexCol xs={6} md={4} className="col-title">
													<strong>Consumo fora de Ponta</strong>
												</FlexCol>
												<FlexCol xs={6} md={2} className='col-padding'>
													{item.consumo_fora_ponta} Kwh
												</FlexCol>
												<FlexCol xs={6} md={4} className="col-title">
													<strong>Iluminação</strong>
												</FlexCol>
												<FlexCol xs={6} md={2} className='col-padding'>
													R$ {item.iluminacao}
												</FlexCol>
											</FlexRow>
											<FlexRow>
												<FlexCol xs={6} md={4} className="col-title">
													<strong>Consumo Total</strong>
												</FlexCol>
												<FlexCol xs={6} md={2} className='col-padding'>
													{item.consumo} Kwh
												</FlexCol>
												<FlexCol xs={6} md={4} className="col-title">
													<strong>Outros</strong>
												</FlexCol>
												<FlexCol xs={6} md={2} className='col-padding'>
													R$ {item.outros}
												</FlexCol>
											</FlexRow>
											<FlexRow>
												<FlexCol xs={6} md={4} className="col-title">
													<strong>Demanda na Ponta</strong>
												</FlexCol>
												<FlexCol xs={6} md={2} className='col-padding'>
													{item.demanda_ponta} Kw
												</FlexCol>
												<FlexCol xs={6} md={4} className="col-title">
													<strong>Multa na Ponta</strong>
												</FlexCol>
												<FlexCol xs={6} md={2} className='col-padding'>
													R$ {item.multa_ponta}
												</FlexCol>
											</FlexRow>
											<FlexRow>
												<FlexCol xs={6} md={4} className="col-title">
													<strong>Demanda fora de Ponta</strong>
												</FlexCol>
												<FlexCol xs={6} md={2} className='col-padding'>
													{item.demanda_fp} Kw
												</FlexCol>
												<FlexCol xs={6} md={4} className="col-title">
													<strong>Multa fora de Ponta</strong>
												</FlexCol>
												<FlexCol xs={6} md={2} className='col-padding'>
													R$ {item.multa_fp}
												</FlexCol>
											</FlexRow>
											<FlexRow>
												<FlexCol xs={6} md={4} className="col-title">
													<strong>Custo Demanda na Ponta</strong>
												</FlexCol>
												<FlexCol xs={6} md={6} className='col-padding'>
													R$ {item.custo_demanda_ponta}
												</FlexCol>
											</FlexRow>
											<FlexRow>
												<FlexCol xs={6} md={4} className="col-title">
													<strong>Custo Demanda fora de Ponta</strong>
												</FlexCol>
												<FlexCol xs={6} md={6} className='col-padding'>
													R$ {item.custo_demanda_fp}
												</FlexCol>
											</FlexRow>
											<FlexRow>
												<FlexCol xs={6} md={2} className="col-title">
												</FlexCol>
												<FlexCol xs={6} md={2} className='col-padding'>
												</FlexCol>
												<FlexCol xs={6} md={4} className="col-title total">
													<strong>Total da fatura</strong>
												</FlexCol>
												<FlexCol xs={6} md={4} className='col-padding total'>
													R$ {item.total}
												</FlexCol>
											</FlexRow>
										</FlexGrid>
									</CardBody>
								</Card>
							</Collapse>
						</ListGroupItem>
					</React.Fragment>
				)
			});
		}

		return (
			<div className='faturas'>
				{spinner}
				<Alert isOpen={this.state.show_error_notification} color="danger" fade={true}>
					Selecione uma unidade!
				</Alert>
				<Row>
					<Col xs="4" sm="4">
						<Card>
							<CardHeader>
								Organizações
							</CardHeader>
							<CardBody>
								<TreeViewMenu
									data={this.state.treeData}
									onClickItem={this.update}
									initialOpenNodes={['organizacao_nome']}
									debounceTime={125}>
									{({ search, items }) => (
										<>
											<ListGroup>
												{items.map(props => (
													<ListItem {...props} />
												))}
											</ListGroup>
										</>
									)}
								</TreeViewMenu>
							</CardBody>
						</Card>
					</Col>
					<Col xs="8" sm="8">
						<Card>
							<CardBody>
								<h2>Unidade</h2>
								Selecione o mês
								<br/>
								<DatePicker
									className='date-field'
									selected={this.state.date}
									onChange={this.handleDateChange}
									dateFormat="MM/yyyy"
									locale="pt-BR"
									showMonthYearPicker
								/>
								<ListGroup className='fatura-table'>
									<ListGroupItem className='list-item table-header'>
										<div className='list-cell'>Medidor</div>
										<div className='list-cell'>Consumo Total (Kwh)</div>
										<div className='list-cell'>Total (R$)</div>
										<div className='list-cell'></div>
									</ListGroupItem>
									{leituras_list}
								</ListGroup>
							</CardBody>
						</Card>
					</Col>
				</Row>
			</div>
		)
	}
}

export default Faturas;
