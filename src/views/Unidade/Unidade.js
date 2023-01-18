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

import FileUploadProgress  from 'react-fileupload-progress';

const styles = {
	progressWrapper: {
		height: '50px',
		marginTop: '10px',
		width: '400px',
		float:'left',
		overflow: 'hidden',
		backgroundColor: '#f5f5f5',
		borderRadius: '4px',
		WebkitBoxShadow: 'inset 0 1px 2px rgba(0,0,0,.1)',
		boxShadow: 'inset 0 1px 2px rgba(0,0,0,.1)'
	},
	progressBar: {
		float: 'left',
		width: '0',
		height: '100%',
		fontSize: '12px',
		lineHeight: '20px',
		color: '#fff',
		textAlign: 'center',
		backgroundColor: '#5cb85c',
		WebkitBoxShadow: 'inset 0 -1px 0 rgba(0,0,0,.15)',
		boxShadow: 'inset 0 -1px 0 rgba(0,0,0,.15)',
		WebkitTransition: 'width .6s ease',
		Otransition: 'width .6s ease',
		transition: 'width .6s ease'
	},
	cancelButton: {
		marginTop: '5px',
		WebkitAppearance: 'none',
		padding: 0,
		cursor: 'pointer',
		background: '0 0',
		border: 0,
		float: 'left',
		fontSize: '21px',
		fontWeight: 700,
		lineHeight: 1,
		color: '#000',
		textShadow: '0 1px 0 #fff',
		filter: 'alpha(opacity=20)',
		opacity: '.2'
	},

	bslabel: {
		display: 'inline-block',
		maxWidth: '100%',
		marginBottom: '5px',
		fontWeight: 700
	},

	bsHelp: {
		display: 'block',
		marginTop: '5px',
		marginBottom: '10px',
		color: '#737373'
	},

	bsButton: {
		padding: '5px 5px 5px 5px',
		margin: '5px 5px 5px 0px',
		fontSize: '12px',
		lineHeight: '1.5',
		borderRadius: '3px',
		color: '#fff',
		backgroundColor: '#337ab7',
		borderColor: '#2e6da4',
		display: 'inline-block',
		marginBottom: 0,
		fontWeight: 400,
		textAlign: 'center',
		whiteSpace: 'nowrap',
		verticalAlign: 'middle',
		touchAction: 'manipulation',
		cursor: 'pointer',
		WebkitUserSelect: 'none',
		MozUserSelect: 'none',
		msUserSelect: 'none',
		userSelect: 'none',
		backgroundImage: 'none',
		border: '1px solid transparent'
	}
};


const TIPO_CAMPO = require('../../data/tipo_campo');
const NATUREZA_CONSUMO = require('../../data/natureza_consumo');

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
			color: props.natureza_consumo,
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

class Unidade extends Component {

	constructor (props) {
		super(props);

		let organizacao_id = '';

		if (props.location) {
			let queryParams = props.location.search;
			organizacao_id = queryParams.split('=')[1];
		}

		this.state = {
			show_spinner: false,
			show_notification: false,
			show_notification_error_medidor_repetido: false,
			show_organizacao_layout: true,
			show_unidade_layout: false,
			show_medidor_layout: false,
			show_modal_unidade: false,
			show_modal_medidor: false,
			show_modal_excluir_medidor: false,
			show_modal_excluir_unidade: false,
			enabled_medidor_modal: false,
			enabled_unidade_modal: false,
			show_tipo_medidor: false,
			bl_supervisor: false,
			organizacao_id: organizacao_id,
			organizacao_nome: '',
			unidade_id: '',
			unidade_nome: '',
			unidade_endereco: '',
			nome_responsavel_unidade: '',
			email_responsavel_unidade: '',
			medidor_id: '',
			medidor_identificador: '',
			medidor_nome: '',
			tipo_medidor: '',
			natureza_consumo: '',
			unidade_nome_modal: '',
			unidade_endereco_modal: '',
			nome_responsavel_unidade_modal: '',
			email_responsavel_unidade_modal: '',
			medidor_identificador_modal: '',
			medidor_nome_modal: '',
			demanda_contratada_ponta: '',
			demanda_contratada_fp: '',
			demanda_contratada_ponta_modal: '',
			demanda_contratada_fp_modal: '',
			style_fiscal: '',
			link_logo: '',
			unidades: [],
			treeData: {
				organizacao_nome: {
					label: '',
					icon: 'fas fa-sitemap',
					type: 'organizacao',
					index: 0,
					nodes: {},
				}
			}
		};

		this.updateInputValueOrganizacaoNome = this.updateInputValueOrganizacaoNome.bind(this);
		this.updateInputValueUnidadeNome = this.updateInputValueUnidadeNome.bind(this);
		this.updateInputValueUnidadeEndereco = this.updateInputValueUnidadeEndereco.bind(this);
		this.updateInputValueNomeResponsavel = this.updateInputValueNomeResponsavel.bind(this);
		this.updateInputValueEmailResponsavel = this.updateInputValueEmailResponsavel.bind(this);
		this.updateInputValueMedidorIdentificador = this.updateInputValueMedidorIdentificador.bind(this);
		this.updateInputValueMedidorNome = this.updateInputValueMedidorNome.bind(this);
		this.updateInputValueMedidorIdentificadorModal = this.updateInputValueMedidorIdentificadorModal.bind(this);
		this.updateInputValueMedidorNomeModal = this.updateInputValueMedidorNomeModal.bind(this);
		this.updateInputValueOrganizacaoNomeModal = this.updateInputValueOrganizacaoNomeModal.bind(this);
		this.updateInputValueUnidadeNomeModal = this.updateInputValueUnidadeNomeModal.bind(this);
		this.updateInputValueUnidadeEnderecoModal = this.updateInputValueUnidadeEnderecoModal.bind(this);
		this.updateInputValueNomeResponsavelModal = this.updateInputValueNomeResponsavelModal.bind(this);
		this.updateInputValueEmailResponsavelModal = this.updateInputValueEmailResponsavelModal.bind(this);
		this.handleNaturezaChange = this.handleNaturezaChange.bind(this);
		this.handleMedidorChange = this.handleMedidorChange.bind(this);
		this.update = this.update.bind(this);
		this.salvar_organizacao = this.salvar_organizacao.bind(this);
		this.salvar_unidade = this.salvar_unidade.bind(this);
		this.salvar_medidor = this.salvar_medidor.bind(this);
		this.novo_medidor = this.novo_medidor.bind(this);
		this.nova_unidade = this.nova_unidade.bind(this);
		this.salvarNovaUnidade = this.salvarNovaUnidade.bind(this);
		this.salvarNovoMedidor = this.salvarNovoMedidor.bind(this);
		this.closeModal = this.closeModal.bind(this);
		this.goTarifas = this.goTarifas.bind(this);
		this.goTarifasAgua = this.goTarifasAgua.bind(this);
		this.excluir_medidor = this.excluir_medidor.bind(this);
		this.confirmaExcluirMedidor = this.confirmaExcluirMedidor.bind(this);
		this.excluirUnidade = this.excluirUnidade.bind(this);
		this.confirmaExcluirUnidade = this.confirmaExcluirUnidade.bind(this);
		this.updateInputDemandaPonta = this.updateInputDemandaPonta.bind(this);
		this.updateInputDemandaFP = this.updateInputDemandaFP.bind(this);
		this.updateInputDemandaPontaModal = this.updateInputDemandaPontaModal.bind(this);
		this.updateInputDemandaFpModal = this.updateInputDemandaFpModal.bind(this);
	}

	create_nodes(unidades) {

		let nodes = {};

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


			nodes[unidade.nome] = node_unidade;
		}

		return nodes;
	}

	componentDidMount() {

		const newState = {...this.state};

		newState.show_spinner = true;
		this.setState(newState);

		let url = `/unidade?id_organizacao=${this.state.organizacao_id}`;

		axios.get(url)
			.then(response => {
				const newState = {...this.state};

				newState.show_spinner = false;

				newState.organizacao_nome = response.data.nome_organizacao;
				newState.bl_supervisor = response.data.bl_supervisor;
				newState.link_logo = response.data.link_logo;
				newState.treeData.organizacao_nome.label = newState.organizacao_nome;
				newState.unidades = response.data.unidades;

				let unidades = response.data.unidades;
				newState.treeData.organizacao_nome.nodes = this.create_nodes(unidades);

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

	updateInputValueOrganizacaoNome(event) {
		this.setState({
			organizacao_nome: event.target.value,
		});
	}

	updateInputValueUnidadeNome(event) {
		this.setState({
			unidade_nome: event.target.value,
		});
	}

	updateInputValueUnidadeEndereco(event) {
		this.setState({
			unidade_endereco: event.target.value,
		});
	}

	updateInputValueNomeResponsavel(event) {
		this.setState({
			nome_responsavel_unidade: event.target.value,
		});
	}

	updateInputValueEmailResponsavel(event) {
		this.setState({
			email_responsavel_unidade: event.target.value,
		});
	}

	updateInputDemandaPonta(event) {
		this.setState({
			demanda_contratada_ponta: event.target.value,
		});
	}

	updateInputDemandaFP(event) {
		this.setState({
			demanda_contratada_fp: event.target.value,
		});
	}

	updateInputDemandaPontaModal(event) {
		this.setState({
			demanda_contratada_ponta_modal: event.target.value,
		});
	}

	updateInputDemandaFpModal(event) {
		this.setState({
			demanda_contratada_fp_modal: event.target.value,
		});
	}

	updateInputValueOrganizacaoNomeModal(event) {
		this.setState({
			organizacao_nome_modal: event.target.value,
		});
	}

	updateInputValueUnidadeNomeModal(event) {

		let nome = event.target.value;

		this.setState({
			unidade_nome_modal: nome,
			enabled_unidade_modal: nome.length > 0
		});
	}

	updateInputValueUnidadeEnderecoModal(event) {
		this.setState({
			unidade_endereco_modal: event.target.value,
		});
	}

	updateInputValueNomeResponsavelModal(event) {
		this.setState({
			nome_responsavel_unidade_modal: event.target.value,
		});
	}

	updateInputValueEmailResponsavelModal(event) {
		this.setState({
			email_responsavel_unidade_modal: event.target.value,
		});
	}

	updateInputValueMedidorIdentificador(event) {
		this.setState({
			medidor_identificador: event.target.value,
		});
	}

	updateInputValueMedidorNome(event) {
		this.setState({
			medidor_nome: event.target.value,
		});
	}

	updateInputValueMedidorIdentificadorModal(event) {

		let identificador = event.target.value;

		let {tipo_medidor} = this.state;

		this.setState({
			medidor_identificador_modal: identificador,
			enabled_medidor_modal: identificador.length > 0 && tipo_medidor !== null && tipo_medidor !== ''
		});
	}

	updateInputValueMedidorNomeModal(event) {
		this.setState({
			medidor_nome_modal: event.target.value,
		});
	}

	handleMedidorChange(selectedOption) {

		let {medidor_identificador_modal} = this.state;

		this.setState({
			tipo_medidor: selectedOption,
			enabled_medidor_modal: medidor_identificador_modal.length > 0 && selectedOption !== null
		});
	}

	handleNaturezaChange(selectedOption) {

		let {medidor_identificador_modal} = this.state;

		let show_tipo_medidor = false;

		if(selectedOption !== null && selectedOption.id === 1) {
			show_tipo_medidor = true;
		}

		this.setState({
			natureza_consumo: selectedOption,
			enabled_medidor_modal: medidor_identificador_modal.length > 0 && selectedOption !== null,
			show_tipo_medidor: show_tipo_medidor
		});
	}

	update(props) {

		const newState = {...this.state};

		newState.show_organizacao_layout = props.type === 'organizacao';
		newState.show_unidade_layout = props.type === 'unidade';
		newState.show_medidor_layout = props.type === 'medidor';

		if(props.medidor_id !== undefined) {
			let unidade = _.map(this.state.unidades, function(u) {
				if (u.id === props.unidade_id) return u;
			});
			unidade = _.without(unidade, undefined)[0];

			let medidor = _.map(unidade.medidores, function(m) {
				if (m.id_medidor === props.medidor_id) return m;
			});
			medidor = _.without(medidor, undefined)[0];

			let tipo_medidor = _.map(TIPO_CAMPO.TIPO_CAMPO, function(m) {
				if (m.id === medidor.id_tipo_medidor) return m;
			});
			tipo_medidor = _.without(tipo_medidor, undefined)[0];

			let natureza = _.map(NATUREZA_CONSUMO.NATUREZA_CONSUMO, function(m) {
				if (m.id === medidor.natureza_consumo) return m;
			});
			natureza = _.without(natureza, undefined)[0];

			newState.unidade_id = unidade.id;
			newState.medidor_id = medidor.id_medidor;
			newState.demanda_contratada_ponta = unidade.demanda_contratada_ponta;
			newState.demanda_contratada_fp = unidade.demanda_contratada_fp;
			newState.medidor_identificador = medidor.identificador;
			newState.medidor_nome = medidor.nome_medidor;
			newState.tipo_medidor = tipo_medidor;
			newState.natureza_consumo = natureza;

			let show_tipo_medidor = false;

			if(natureza !== undefined && natureza !== null && natureza.id === 1) {
				show_tipo_medidor = true;
			}
			newState.show_tipo_medidor = show_tipo_medidor;
		} else if(props.unidade_id !== undefined) {
			let unidade = _.map(this.state.unidades, function(u) {
				if (u.id === props.unidade_id) return u;
			});
			unidade = _.without(unidade, undefined)[0];

			newState.unidade_id = unidade.id;
			newState.unidade_nome = unidade.nome;
			newState.demanda_contratada_ponta = unidade.demanda_contratada_ponta;
			newState.demanda_contratada_fp = unidade.demanda_contratada_fp;
			newState.unidade_endereco = unidade.endereco;
			newState.nome_responsavel_unidade = unidade.nome_responsavel;
			newState.email_responsavel_unidade = unidade.email_responsavel;
		}

		this.setState(newState);
	}

	nova_unidade() {
		const newState = {...this.state};
		newState.show_modal_unidade = true;
		newState.unidade_nome_modal = '';
		newState.unidade_endereco_modal = '';
		newState.demanda_contratada_modal = '';
		newState.nome_responsavel_unidade_modal = '';
		newState.email_responsavel_unidade_modal = '';
		this.setState(newState);
	}

	novo_medidor() {
		const newState = {...this.state};
		newState.show_modal_medidor = true;
		newState.medidor_identificador_modal = '';
		newState.medidor_nome_modal = '';
		newState.tipo_medidor = '';
		newState.enabled_medidor_modal = false;
		newState.natureza_consumo = '';
		newState.show_tipo_medidor = false;
		this.setState(newState);
	}

	salvar_unidade() {
		const newState = {...this.state};
		newState.show_spinner = true;
		this.setState(newState);

		const params = new URLSearchParams();
		params.append('organizacao_id', this.state.organizacao_id);
		params.append('id_unidade', this.state.unidade_id);
		params.append('nome', this.state.unidade_nome !== null ? this.state.unidade_nome : '');
		params.append('demanda_contratada_ponta', this.state.demanda_contratada_ponta !== null ? this.state.demanda_contratada_ponta : '');
		params.append('demanda_contratada_fp', this.state.demanda_contratada_fp !== null ? this.state.demanda_contratada_fp : '');
		params.append('endereco', this.state.unidade_endereco !== null ? this.state.unidade_endereco : '');
		params.append('nome_responsavel', this.state.nome_responsavel_unidade !== null ? this.state.nome_responsavel_unidade : '');
		params.append('email_responsavel', this.state.email_responsavel_unidade !== null ? this.state.email_responsavel_unidade : '');

		const url = `/unidade`;
		axios.put(url, params)
			.then(response => {
				let unidades = response.data.unidades;

				newState.show_spinner = false;
				newState.show_notification = true;

				newState.unidades = unidades;

				newState.treeData.organizacao_nome.nodes = this.create_nodes(unidades);

				this.setState(newState);

				setTimeout(function() {
					const newState = {...this.state};
					newState.show_notification = false;
					this.setState(newState);
				}.bind(this), 2000)

			}).catch(error => {
		});
	}

	salvar_medidor() {

		const newState = {...this.state};
		newState.show_spinner = true;
		this.setState(newState);

		console.log(this.state.tipo_medidor);

		const params = new URLSearchParams();
		params.append('organizacao_id', this.state.organizacao_id);
		params.append('id_medidor', this.state.medidor_id);
		params.append('nome', this.state.medidor_nome !== null ? this.state.medidor_nome : '');
		params.append('identificador', this.state.medidor_identificador !== null ? this.state.medidor_identificador : '');
		params.append('tipo_medidor', this.state.tipo_medidor !== '' ? this.state.tipo_medidor.id : '');
		params.append('natureza_consumo', this.state.natureza_consumo !== null ? this.state.natureza_consumo.id : '');

		const url = `/medidor`;
		axios.put(url, params)
			.then(response => {
				let unidades = response.data.unidades;

				newState.show_spinner = false;
				newState.show_notification = true;

				newState.unidades = unidades;

				newState.treeData.organizacao_nome.nodes = this.create_nodes(unidades);

				this.setState(newState);

				setTimeout(function() {
					const newState = {...this.state};
					newState.show_notification = false;
					this.setState(newState);
				}.bind(this), 2000)

			}).catch(error => {
			if(error.response.status === 400) {
				const newState = {...this.state};
				newState.show_notification_error_medidor_repetido = true;
				newState.show_spinner = false;
				this.setState(newState);

				setTimeout(function () {
					const newState = {...this.state};
					newState.show_notification_error_medidor_repetido = false;
					this.setState(newState);
				}.bind(this), 2000);
			}
		});
	}

	salvar_organizacao() {

		const newState = {...this.state};
		newState.show_spinner = true;
		this.setState(newState);

		const params = new URLSearchParams();
		params.append('id', this.state.organizacao_id);
		params.append('nome', this.state.organizacao_nome);

		const url = `/organizacao`;
		axios.put(url, params)
			.then(response => {
				let unidades = response.data.unidades;

				newState.show_spinner = false;
				newState.show_notification = true;

				newState.unidades = unidades;

				newState.treeData.organizacao_nome.nodes = this.create_nodes(unidades);

				this.setState(newState);

				setTimeout(function() {
					const newState = {...this.state};
					newState.show_notification = false;
					this.setState(newState);
				}.bind(this), 2000)

			}).catch(error => {
				console.log('error');
		});
	}

	salvarNovaUnidade() {
		const newState = {...this.state};
		newState.show_spinner = true;
		this.setState(newState);

		const params = new URLSearchParams();
		params.append('organizacao_id', this.state.organizacao_id);
		params.append('nome', this.state.unidade_nome_modal !== null ? this.state.unidade_nome_modal : '');
		params.append('demanda_contratada_ponta', this.state.demanda_contratada_ponta_modal !== null ? this.state.demanda_contratada_ponta_modal : '');
		params.append('demanda_contratada_fp', this.state.demanda_contratada_fp_modal !== null ? this.state.demanda_contratada_fp_modal : '');
		params.append('endereco', this.state.unidade_endereco_modal !== null ? this.state.unidade_endereco_modal : '');
		params.append('nome_responsavel', this.state.nome_responsavel_unidade_modal !== null ? this.state.nome_responsavel_unidade_modal : '');
		params.append('email_responsavel', this.state.email_responsavel_unidade_modal !== null ? this.state.email_responsavel_unidade_modal : '');

		const url = `/unidade`;
		axios.post(url, params)
			.then(response => {
				let unidades = response.data.unidades;

				newState.show_spinner = false;
				newState.show_notification = true;
				newState.show_modal_unidade = false;

				newState.unidades = unidades;

				newState.treeData.organizacao_nome.nodes = this.create_nodes(unidades);

				this.setState(newState);

				setTimeout(function() {
					const newState = {...this.state};
					newState.show_notification = false;
					this.setState(newState);
				}.bind(this), 2000)

			}).catch(error => {
		});
	}

	salvarNovoMedidor() {
		const newState = {...this.state};
		newState.show_spinner = true;
		this.setState(newState);

		const params = new URLSearchParams();
		params.append('organizacao_id', this.state.organizacao_id);
		params.append('id_unidade', this.state.unidade_id);
		params.append('nome', this.state.medidor_nome_modal !== null ? this.state.medidor_nome_modal : '');
		params.append('identificador', this.state.medidor_identificador_modal !== null ? this.state.medidor_identificador_modal : '');
		params.append('tipo_medidor', this.state.tipo_medidor !== '' ? this.state.tipo_medidor.id : '');
		params.append('natureza_consumo', this.state.natureza_consumo !== null ? this.state.natureza_consumo.id : '');

		const url = `/medidor`;
		axios.post(url, params)
			.then(response => {
				let unidades = response.data.unidades;

				newState.show_spinner = false;
				newState.show_notification = true;
				newState.show_modal_medidor = false;

				newState.unidades = unidades;

				newState.treeData.organizacao_nome.nodes = this.create_nodes(unidades);

				this.setState(newState);

				setTimeout(function() {
					const newState = {...this.state};
					newState.show_notification = false;
					this.setState(newState);
				}.bind(this), 2000)

			}).catch(error => {
			if(error.response.status === 400) {
				const newState = {...this.state};
				newState.show_notification_error_medidor_repetido = true;
				newState.show_spinner = false;
				newState.show_modal_medidor = false;
				this.setState(newState);

				setTimeout(function () {
					const newState = {...this.state};
					newState.show_notification_error_medidor_repetido = false;
					this.setState(newState);
				}.bind(this), 2000);
			}
		});
	}

	excluir_medidor() {
		const newState = {...this.state};
		newState.show_modal_excluir_medidor = true;
		this.setState(newState);
	}

	confirmaExcluirMedidor() {

		const newState = {...this.state};
		newState.show_spinner = true;
		this.setState(newState);

		const url = `/medidor`;
		axios.delete(url, {
			params: {
				'id_medidor': this.state.medidor_id,
				'organizacao_id': this.state.organizacao_id
			}
		})
		.then(response => {
			const newState = {...this.state};
			newState.show_spinner = false;
			newState.show_notification = true;
			newState.show_modal_excluir_medidor = false;
			newState.show_modal_excluir = false;
			let unidades = response.data.unidades;
			newState.unidades = unidades;
			newState.treeData.organizacao_nome.nodes = this.create_nodes(unidades);
			this.setState(newState);
			setTimeout(function() {
				const newState = {...this.state};
				newState.show_notification = false;
				this.setState(newState);
			}.bind(this), 2000)
		}).catch(error => {
			if(typeof error.response !== 'undefined') {
				if(error.response.status === 401) {
					localStorage.removeItem('login-data');
					window.location = '/#/login'
				} else if(error.response.status === 500) {
					// const newState = {...this.state};
					// newState.show_error_notification = true;
					// this.setState(newState);
				}
			}
		});
	}

	excluirUnidade() {
		const newState = {...this.state};
		newState.show_modal_excluir_unidade = true;
		this.setState(newState);
	}

	confirmaExcluirUnidade() {

		const newState = {...this.state};
		newState.show_spinner = true;
		this.setState(newState);

		const url = `/unidade`;
		axios.delete(url, {
			params: {
				'id_unidade': this.state.unidade_id,
				'organizacao_id': this.state.organizacao_id
			}
		})
		.then(response => {
			const newState = {...this.state};
			newState.show_spinner = false;
			newState.show_notification = true;
			newState.show_modal_excluir_unidade = false;
			newState.show_modal_excluir = false;
			newState.unidade_id = '';
			let unidades = response.data.unidades;
			newState.unidades = unidades;
			newState.treeData.organizacao_nome.nodes = this.create_nodes(unidades);
			this.setState(newState);
			setTimeout(function() {
				const newState = {...this.state};
				newState.show_notification = false;
				this.setState(newState);
			}.bind(this), 2000)
		}).catch(error => {
		if(typeof error.response !== 'undefined') {
			if(error.response.status === 401) {
				localStorage.removeItem('login-data');
				window.location = '/#/login'
			} else if(error.response.status === 500) {
				// const newState = {...this.state};
				// newState.show_error_notification = true;
				// this.setState(newState);
			}
		}
		});
	}

	closeModal() {
		const newState = {...this.state};
		newState.show_modal_unidade = false;
		newState.show_modal_medidor = false;
		newState.show_modal_excluir_medidor = false;
		newState.show_modal_excluir_unidade = false;
		this.setState(newState);
	}

	goTarifas() {
		window.location = `/#/organizacao/tarifas?id_unidade=${this.state.unidade_id}&id_tarifa=`
	}

	goTarifasAgua() {
		window.location = `/#/organizacao/tarifas-agua?id_unidade=${this.state.unidade_id}&id_tarifa=`
	}

	formGetterFiscal(){
		let data = document.getElementById('customFormFiscal');
		let loginData = JSON.parse(localStorage.getItem('login-data'));

		let formData = new FormData(data);

		formData.append('token', loginData.token);
		formData.append('user_name', loginData.login);
		formData.append('user_id', loginData.user_id);
		formData.append('organizacao', this.state.organizacao_id);
		return formData;
	}

	customFormRendererFiscal(onSubmit){
		return (
			<form id='customFormFiscal' style={{marginBottom: '15px'}}>
				<label style={styles.bslabel} htmlFor="exampleInputFile">Logo da Empresa</label>
				<input style={{display: 'block'}} type="file" name='file' id="exampleInputFile" placeholder='asdfas'/>
				<button type="button" style={styles.bsButton} onClick={onSubmit}>Enviar logo</button>
			</form>
		);
	}

	customProgressRenderer(progress, hasError, cancelHandler) {

		if (hasError || progress > -1 ) {
			let barStyle = Object.assign({}, styles.progressBar);
			barStyle.width = progress + '%';

			let message = (<span>{barStyle.width}</span>);
			if (hasError) {
				barStyle.backgroundColor = '#d9534f';
				message = (<span style={{'color': '#a94442'}}>O upload falhou...</span>);
			}else if (progress === 100 && this.state.link_documento_fiscal !== ''){
				message = (<span >Concluído!</span>);
			}

			return (
				<div>
					<div className={this.state.style_fiscal}>

						<div style={styles.progressWrapper}>
							<div style={barStyle}></div>
						</div>
						<button style={styles.cancelButton} onClick={cancelHandler}>
							<span>&times;</span>
						</button>
					</div>
					<div style={{'clear':'left'}}>
						{message}
					</div>
				</div>
			);
		} else {
			return;
		}
	}

	organizacao_layout() {

		let image = <div></div>;
		console.log(this.state.link_logo);
		if(this.state.link_logo !== null && this.state.link_logo !== '') {
			image = <img className='logo-org' src={this.state.link_logo}/>;
		}

		return <div>
			{image}
			<br/>
			<Label>Nome da organização</Label>
			<Input type="text" placeholder="Nome da Organização" value={this.state.organizacao_nome} onChange={this.updateInputValueOrganizacaoNome}/>
			<br/>
			<FileUploadProgress key='ex1' url='https://api.eletricom.me/arquivo' method='post'
				onProgress={(e, request, progress) => {console.log('progress', e, request, progress);}}
				onLoad={ (e, request) => {
					console.log(request);
					this.setState({
						link_logo: request.response,
						style_fiscal: 'hide-upload'
					});
				}}
				onError={ (e, request) => {

					if(request.status === 400) {
						const newState = {...this.state};
						newState.show_error_notification_formato = true;
						this.setState(newState);

						setTimeout(function() {
							const newState = {...this.state};
							newState.show_error_notification_formato = false;
							this.setState(newState);
						}.bind(this), 2000);
					}else if(request.status === 405) {
						const newState = {...this.state};
						newState.show_error_notification_tamanho = true;
						this.setState(newState);

						setTimeout(function() {
							const newState = {...this.state};
							newState.show_error_notification_tamanho = false;
							this.setState(newState);
						}.bind(this), 2000);
					}
				}}
				onAbort={ (e, request) => {console.log('abort', e, request);}}
				formGetter={this.formGetterFiscal.bind(this)}
				formRenderer={this.customFormRendererFiscal.bind(this)}
				progressRenderer={this.customProgressRenderer.bind(this)}
			/>
			{!this.state.bl_supervisor &&
			<Button color="success" onClick={this.salvar_organizacao} >Salvar</Button>}
			{!this.state.bl_supervisor &&
			<Button color="primary" onClick={this.nova_unidade} >Criar nova unidade</Button>}
		</div>
	}

	unidade_layout() {

		let tarifas_list_energia = <div></div>;
		let tarifas_list_agua = <div></div>;

		let unidade_id = this.state.unidade_id;

		let unidade = _.map(this.state.unidades, function(u) {
			if (u.id === unidade_id) return u;
		});
		unidade = _.without(unidade, undefined)[0];

		if (unidade !== undefined && unidade.tarifas_energia !== undefined && unidade.tarifas_energia.length > 0) {
			tarifas_list_energia = unidade.tarifas_energia.map(item => {

				let periodo_inicio = moment(new Date(Date.parse(item.periodo_inicio))).format('DD/MM/YYYY');
				let periodo_fim = moment(new Date(Date.parse(item.periodo_fim))).format('DD/MM/YYYY');

				let link = `/#/organizacao/tarifas?id_unidade=${this.state.unidade_id}&id_tarifa=${item.id}`;

				return (
					<tr>
						<td>{item.nome}</td>
						<td>{periodo_inicio}</td>
						<td>{periodo_fim}</td>
						<td>
							<a className="edit-button" href={link}>
								<Button color="success edit-button" >
									<i title="Baixar boleto" className="far fa-edit"></i>
									Editar
								</Button>
							</a>
						</td>
					</tr>
				)
			});
		}

		if (unidade !== undefined && unidade.tarifas_agua !== undefined && unidade.tarifas_agua.length > 0) {
			tarifas_list_agua = unidade.tarifas_agua.map(item => {

				let periodo_inicio = moment(new Date(Date.parse(item.periodo_inicio))).format('DD/MM/YYYY');
				let periodo_fim = moment(new Date(Date.parse(item.periodo_fim))).format('DD/MM/YYYY');

				let link = `/#/organizacao/tarifas-agua?id_unidade=${this.state.unidade_id}&id_tarifa=${item.id}`;

				return (
					<tr>
						<td>{item.nome}</td>
						<td>{periodo_inicio}</td>
						<td>{periodo_fim}</td>
						<td>
							<a className="edit-button" href={link}>
								<Button color="success edit-button" >
									<i title="Baixar boleto" className="far fa-edit"></i>
									Editar
								</Button>
							</a>
						</td>
					</tr>
				)
			});
		}

		return <div>
			<Label>Nome da Unidade</Label>
			<Input type="text" placeholder="Nome da Unidade" value={this.state.unidade_nome} onChange={this.updateInputValueUnidadeNome}/>
			<Label>Endereço da Unidade</Label>
			<Input type="text" placeholder="Endereço da Unidade" value={this.state.unidade_endereco} onChange={this.updateInputValueUnidadeEndereco}/>
			<Label>Nome do responsável</Label>
			<Input type="text" placeholder="Nome do Responsável" value={this.state.nome_responsavel_unidade} onChange={this.updateInputValueNomeResponsavel}/>
			<Label>Email do responsável</Label>
			<Input type="text" placeholder="Email do responsável" value={this.state.email_responsavel_unidade} onChange={this.updateInputValueEmailResponsavel}/>
			<Label>Demanda HFP</Label>
			<Input type="number" placeholder="Demanda HFP" value={this.state.demanda_contratada_fp} onChange={this.updateInputDemandaFP}/>
			<Label>Demanda HP (Opcional)</Label>
			<Input type="number" placeholder="Demanda HP" value={this.state.demanda_contratada_ponta} onChange={this.updateInputDemandaPonta}/>
			<Button color="success" onClick={this.salvar_unidade} >Salvar</Button>
			{!this.state.bl_supervisor &&
			<Button color="primary" onClick={this.novo_medidor} >Criar novo medidor</Button>}
			{!this.state.bl_supervisor &&
			<Button color="danger" onClick={this.excluirUnidade} >Excluir unidade</Button>}

			<div className='separator'></div>
			<h2>Tarifas de Energia</h2>
			<Table className='fatura-table'>
				<thead>
				<tr>
					<th>Nome</th>
					<th>Período Início</th>
					<th>Período Fim</th>
					<th></th>
				</tr>
				</thead>
				<tbody>
				{tarifas_list_energia}
				</tbody>
			</Table>
			<div className='separator'></div>
			<Button color="primary" onClick={this.goTarifas.bind(this, null)}>Nova tarifa de energia</Button>{' '}
			<div className='separator'></div>
			<h2>Tarifas de Água</h2>
			<Table className='fatura-table'>
				<thead>
				<tr>
					<th>Nome</th>
					<th>Período Início</th>
					<th>Período Fim</th>
					<th></th>
				</tr>
				</thead>
				<tbody>
				{tarifas_list_agua}
				</tbody>
			</Table>
			<div className='separator'></div>
			<Button color="primary" onClick={this.goTarifasAgua.bind(this, null)}>Nova tarifa de água</Button>{' '}
		</div>
	}

	medidor_layout() {
		return <div>
			<Label>Identificador</Label>
			<Input type="text" placeholder="Identificador do medidor" value={this.state.medidor_identificador} onChange={this.updateInputValueMedidorIdentificador}/>
			<Label>Nome do medidor</Label>
			<Input type="text" placeholder="Nome do medidor" value={this.state.medidor_nome} onChange={this.updateInputValueMedidorNome}/>
			<Label id="modalidades-label">Selecione a natureza do consumo do medidor.</Label>
			<Select
				options={NATUREZA_CONSUMO.NATUREZA_CONSUMO}
				value={this.state.natureza_consumo}
				placeholder="Energia/Água.."
				onChange={this.handleNaturezaChange}
				multi={false}
			/>
			{this.state.show_tipo_medidor === true &&
			<div>
				<Label id="modalidades-label">Selecione o tipo do medidor.</Label>
				<Select
					options={TIPO_CAMPO.TIPO_CAMPO}
					value={this.state.tipo_medidor}
					placeholder="Tipo.."
					onChange={this.handleMedidorChange}
					multi={false}
				/>
			</div>}
			<Button color="success" onClick={this.salvar_medidor} >Salvar</Button>
			<Button color="danger" onClick={this.excluir_medidor} >Excluir medidor</Button>
		</div>
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
			<div className='unidades'>
				{spinner}
				<Alert isOpen={this.state.show_notification} color="success" fade={true}>
					Salvo com sucesso!
				</Alert>
				<Alert isOpen={this.state.show_notification_error_medidor_repetido} color="danger" fade={true}>
					Já existe um medidor com este identificador!
				</Alert>
				<Modal isOpen={this.state.show_modal_medidor} className='modal-lotes'>
					<ModalHeader>Medidor</ModalHeader>
					<ModalBody>
						<Label>Identificador</Label>
						<Input type="text" placeholder="Identificador do medidor" value={this.state.medidor_identificador_modal} onChange={this.updateInputValueMedidorIdentificadorModal}/>
						<Label>Nome do medidor</Label>
						<Input type="text" placeholder="Nome do medidor" value={this.state.medidor_nome_modal} onChange={this.updateInputValueMedidorNomeModal}/>
						<Label id="modalidades-label">Selecione a natureza do consumo do medidor.</Label>
						<Select
							options={NATUREZA_CONSUMO.NATUREZA_CONSUMO}
							value={this.state.natureza_consumo}
							placeholder="Energia/Água.."
							onChange={this.handleNaturezaChange}
							multi={false}
						/>
						{this.state.show_tipo_medidor === true &&
						<div>
							<Label id="modalidades-label">Selecione o tipo do medidor.</Label>
							<Select
								options={TIPO_CAMPO.TIPO_CAMPO}
								value={this.state.tipo_medidor}
								placeholder="Tipo.."
								onChange={this.handleMedidorChange}
								multi={false}
							/>
						</div>}
					</ModalBody>
					<ModalFooter>
						<Button id='historico-button' disabled={!this.state.enabled_medidor_modal} className='salvar-button' color="success" onClick={this.salvarNovoMedidor.bind(this, null)}>Salvar</Button>
						<Button color="primary" onClick={this.closeModal.bind(this, null)}>Fechar</Button>{' '}
					</ModalFooter>
				</Modal>
				<Modal isOpen={this.state.show_modal_unidade} className='modal-lotes'>
					<ModalHeader>Unidade</ModalHeader>
					<ModalBody>
						<Label>Nome da Unidade</Label>
						<Input type="text" placeholder="Nome da Unidade" value={this.state.unidade_nome_modal} onChange={this.updateInputValueUnidadeNomeModal}/>
						<Label>Endereço da Unidade</Label>
						<Input type="text" placeholder="Endereço da Unidade" value={this.state.unidade_endereco_modal} onChange={this.updateInputValueUnidadeEnderecoModal}/>
						<Label>Nome do responsável</Label>
						<Input type="text" placeholder="Nome do Responsável" value={this.state.nome_responsavel_unidade_modal} onChange={this.updateInputValueNomeResponsavelModal}/>
						<Label>Email do responsável</Label>
						<Input type="text" placeholder="Email do responsável" value={this.state.email_responsavel_unidade_modal} onChange={this.updateInputValueEmailResponsavelModal}/>
						<Label>Demanda HFP</Label>
						<Input type="number" placeholder="Demanda HFP" value={this.state.demanda_contratada_fp_modal} onChange={this.updateInputDemandaFpModal}/>
						<Label>Demanda HP (Opcional)</Label>
						<Input type="number" placeholder="Demanda HP" value={this.state.demanda_contratada_ponta_modal} onChange={this.updateInputDemandaPontaModal}/>
					</ModalBody>
					<ModalFooter>
						<Button id='historico-button' disabled={!this.state.enabled_unidade_modal} className='salvar-button' color="success" onClick={this.salvarNovaUnidade.bind(this, null)}>Salvar</Button>
						<Button color="primary" onClick={this.closeModal.bind(this, null)}>Fechar</Button>{' '}
					</ModalFooter>
				</Modal>
				<Modal isOpen={this.state.show_modal_excluir_unidade} className='modal-lotes'>
					<ModalHeader>Organização</ModalHeader>
					<ModalBody>
						<label>Deseja excluir esta unidade?</label>
					</ModalBody>
					<ModalFooter>
						<Button id='historico-button' className='salvar-button' color="danger" onClick={this.confirmaExcluirUnidade.bind(this, null)}>Salvar</Button>
						<Button color="primary" onClick={this.closeModal.bind(this, null)}>Fechar</Button>{' '}
					</ModalFooter>
				</Modal>
				<Modal isOpen={this.state.show_modal_excluir_medidor} className='modal-lotes'>
					<ModalHeader>Organização</ModalHeader>
					<ModalBody>
						<label>Deseja excluir este medidor?</label>
					</ModalBody>
					<ModalFooter>
						<Button id='historico-button' className='salvar-button' color="danger" onClick={this.confirmaExcluirMedidor.bind(this, null)}>Salvar</Button>
						<Button color="primary" onClick={this.closeModal.bind(this, null)}>Fechar</Button>{' '}
					</ModalFooter>
				</Modal>
				<Row>
					<Col xs="4" sm="4">
						<Card>
							<CardHeader>
								Organização
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
							<CardHeader>
								Campos
							</CardHeader>
							<CardBody>
								{this.state.show_organizacao_layout ? this.organizacao_layout() : <div></div>}
								{this.state.show_unidade_layout ? this.unidade_layout() : <div></div>}
								{this.state.show_medidor_layout ? this.medidor_layout() : <div></div>}
							</CardBody>
						</Card>
					</Col>
				</Row>
			</div>
		)
	}
}

export default Unidade;
