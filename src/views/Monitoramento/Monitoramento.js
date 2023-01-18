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

class Monitoramento extends Component {

	constructor (props) {
		super(props);

		this.state = {
			show_spinner: false,
			show_error_notification: false,
			startDate: new Date(),
			endDate: new Date(),
			leituras: [],
			organizacao_id: '',
			unidade_id: '',
			medidor_id: '',
			organizacoes: [],
			treeData: {}
		};

		this.update = this.update.bind(this);
		this.handleStartChange = this.handleStartChange.bind(this);
		this.handleEndChange = this.handleEndChange.bind(this);
		this.buscarLeituras = this.buscarLeituras.bind(this);
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

				for (var j = 0, lenj = unidade.medidores.length; j < lenj; j++) {
					let medidor = unidade.medidores[j];
					if(medidor !== undefined) {

						let icon_medidor = 'fas fa-bolt';
						if (medidor.natureza_consumo === 2) {
							icon_medidor = 'fas fa-tint';
						}

						node_unidade.nodes[medidor.nome_medidor] = {
							label: medidor.nome_medidor,
							index: j,
							type: 'medidor',
							unidade_id: unidade.id,
							medidor_id: medidor.id_medidor,
							icon: icon_medidor,
						};
					}
				}

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

	handleStartChange(event) {
		const newState = {...this.state};
		newState.startDate = event;
		this.setState(newState);
	}

	handleEndChange(event) {
		const newState = {...this.state};
		newState.endDate = event;
		this.setState(newState);
	}

	buscarLeituras() {

		if(this.state.medidor_id === '') {
			const newState = {...this.state};
			newState.show_error_notification = true;
			this.setState(newState);

			setTimeout(function() {
				const newState = {...this.state};
				newState.show_error_notification = false;
				this.setState(newState);
			}.bind(this), 2000)
		} else{
			const newState = {...this.state};
			newState.show_spinner = true;
			this.setState(newState);

			let url = `/monitoramento`;

			axios.get(url, {
				params: {
					'id_medidor': this.state.medidor_id,
					'dt_inicio': this.state.startDate,
					'dt_fim': this.state.endDate
				}
			})
				.then(response => {
					const newState = {...this.state};
					newState.show_spinner = false;
					newState.leituras = response.data.leituras;
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

	update(props) {

		const newState = {...this.state};

		let medidor_clicked = props.type === 'medidor';

		if(medidor_clicked) {
			newState.medidor_id = props.medidor_id;
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

		let leituras_list = [];
		if (this.state.leituras !== undefined && this.state.leituras.length > 0) {
			leituras_list = this.state.leituras.map(item => {

				let data_leitura = moment(new Date(Date.parse(item.data))).format('DD/MM/YYYY HH:mm:ss');

				return (
					<tr>
						<td>{data_leitura}</td>
						<td>{item.valor}</td>
					</tr>
				)
			});
		}

		return (
			<div className='monitoramento'>
				{spinner}
				<Alert isOpen={this.state.show_error_notification} color="danger" fade={true}>
					Selecione um medidor!
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
								<Label htmlFor="uf">Leituras a partir de:</Label>
								<DatePicker
									className='date-field'
									selected={this.state.startDate}
									onChange={this.handleStartChange}
									dateFormat="dd/MM/yyyy"
								/>
								<Label htmlFor="uf">Até:</Label>
								<DatePicker
									className='date-field'
									selected={this.state.endDate}
									onChange={this.handleEndChange}
									dateFormat="dd/MM/yyyy"
								/>
								<br/>
								<Button color="primary" className='buscar-button' onClick={this.buscarLeituras.bind(this, null)}>Buscar</Button>{' '}

								<br/>
								<div className='separator'></div>
								<h2>Leituras</h2>
								<Table className='fatura-table'>
									<thead>
									<tr>
										<th>Data de leitura</th>
										<th>pC_1</th>
										<th></th>
									</tr>
									</thead>
									<tbody>
									{leituras_list}
									</tbody>
								</Table>
								<div className='separator'></div>
							</CardBody>
						</Card>
					</Col>
				</Row>
			</div>
		)
	}
}

export default Monitoramento;
