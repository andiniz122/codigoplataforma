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
import {getJsonFromUrl} from "../../index";
import _ from "lodash";

const TIPO_USUARIO = require('../../data/tipo_usuario');



class UsuariosAdmin extends Component {

	constructor (props) {
		super(props);

		this.state = {
			show_spinner: false,
			show_notification: false,
			show_notification_duplicate: false,
			show_notification_excluir: false,
			senha_invalida: false,
			id_usuario: '',
			id_organizacao: '',
			enabled: false,
			enable_medidor: false,
			editing: false,
			nome: '',
			email: '',
			ativo: true,
			senha: '',
			senha2: '',
			tipo_usuario: '',
			unidade: '',
			medidor: '',
			usuarios: [],
			unidades: [],
			medidores: [],
			show_modal: false,
			show_modal_excluir: false,
		};

		this.adicionarLinha = this.adicionarLinha.bind(this);
		this.updateInputValueNome = this.updateInputValueNome.bind(this);
		this.updateInputValueEmail = this.updateInputValueEmail.bind(this);
		this.updateInputValueAtivo = this.updateInputValueAtivo.bind(this);
		this.updateInputValueSenha = this.updateInputValueSenha.bind(this);
		this.updateInputValueSenha2 = this.updateInputValueSenha2.bind(this);
		this.salvar = this.salvar.bind(this);
		this.editar = this.editar.bind(this);
		this.excluir = this.excluir.bind(this);
		this.confirmarExclusao = this.confirmarExclusao.bind(this);
		this.handleTipoUsuarioChange = this.handleTipoUsuarioChange.bind(this);
		this.handleUnidadeChange = this.handleUnidadeChange.bind(this);
		this.handleMedidorChange = this.handleMedidorChange.bind(this);
	}

	componentDidMount() {

		const newState = {...this.state};
		newState.show_spinner = true;
		this.setState(newState);

		axios.get('/register-supervisor')
		.then(response => {
			const newState = {...this.state};
			newState.usuarios = response.data.usuarios;
			newState.unidades = response.data.unidades;
			newState.id_organizacao = response.data.id_organizacao;
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

	salvar() {

		const newState = {...this.state};

		newState.show_modal = false;
		newState.show_spinner = true;

		const params = new URLSearchParams();
		params.append('nome', this.state.nome);
		params.append('email', this.state.email);
		params.append('senha', this.state.senha);
		params.append('ativo', this.state.ativo);
		params.append('organizacao_id', this.state.id_organizacao);
		params.append('unidade_id', this.state.unidade === ''? '' : this.state.unidade.value);
		params.append('medidor_id', this.state.medidor === ''? '' : this.state.medidor.value);
		params.append('tipo_usuario', this.state.tipo_usuario === ''? '' : this.state.tipo_usuario.value);

		const url = `/register`;

		if(newState.editing) {

			params.append('id_usuario', this.state.id_usuario);

			axios.put(url, params)
				.then(response => {
					const newState = {...this.state};
					newState.show_spinner = false;
					newState.show_notification = true;
					newState.usuarios = response.data;
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
					} else if(error.response.status === 400) {
						const newState = {...this.state};
						newState.show_notification_duplicate = true;
						newState.show_spinner = false;
						this.setState(newState);

						setTimeout(function() {
							const newState = {...this.state};
							newState.show_notification_duplicate = false;
							this.setState(newState);
						}.bind(this), 2000)
					} else if(error.response.status === 500) {
						// const newState = {...this.state};
						// newState.show_error_notification = true;
						// this.setState(newState);
					}
				}
			});
		} else {
			axios.post(url, params)
				.then(response => {
					const newState = {...this.state};
					newState.show_spinner = false;
					newState.show_notification = true;
					newState.usuarios = response.data;
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
					} else if(error.response.status === 400) {
						const newState = {...this.state};
						newState.show_notification_duplicate = true;
						newState.show_spinner = false;
						this.setState(newState);

						setTimeout(function() {
							const newState = {...this.state};
							newState.show_notification_duplicate = false;
							this.setState(newState);
						}.bind(this), 2000)
					} else if(error.response.status === 500) {
						// const newState = {...this.state};
						// newState.show_error_notification = true;
						// this.setState(newState);
					}
				}
			});
		}


		this.setState(newState);
	}

	adicionarLinha() {
		const newState = {...this.state};
		newState.show_modal = true;
		newState.nome = '';
		newState.email = '';
		newState.senha = '';
		newState.senha2 = '';
		newState.unidade = '';
		newState.medidor = '';
		newState.tipo_usuario = '';
		newState.enable_medidor = false;
		newState.ativo = true;
		newState.editing = false;
		newState.enabled = false;
		this.setState(newState);
	}

	navigateOrganizacao(item) {
		window.location = `/#/organizacao/unidades?id_organizacao=${item.id}`;
	}

	updateInputValueNome(event) {

		let nome = event.target.value;

		this.setState({
			nome: nome,
		}, () => {
			this.validate();
		});
	}

	updateInputValueEmail(event) {

		let email = event.target.value;

		this.setState({
			email: email,
		}, () => {
			this.validate();
		});
	}

	updateInputValueAtivo(event) {

		let ativo = event.target.checked;

		this.setState({
			ativo: ativo,
		}, () => {
			this.validate();
		});
	}

	updateInputValueSenha(event) {

		let senha = event.target.value;

		this.setState({
			senha: senha,
		}, () => {
			this.validate();
		});
	}

	updateInputValueSenha2(event) {

		let senha2 = event.target.value;

		this.setState({
			senha2: senha2,
		}, () => {
			this.validate();
		});
	}

	validate() {
		const {nome, email, senha, senha2, unidade, tipo_usuario, medidor, editing} = this.state;

		let ok_nome = nome.length > 0;
		let ok_email = email.length > 0;
		let ok_tipo = tipo_usuario !== null && tipo_usuario !== '';
		let ok_unidade = unidade !== '';
		let ok_medidor = true;

		let ok_senha1 = senha.length > 0;
		let ok_senha2 = senha2.length > 0;
		let invalid = senha2.length !== 0 && senha2 !== senha;

		let ok_senha = false;

		if(editing) {
			ok_senha = (senha.length === 0 && senha2.length === 0 ) || !invalid;
		} else {
			ok_senha = ok_senha1 && ok_senha2 && !invalid;
		}

		if(tipo_usuario !== null && tipo_usuario !== '' && tipo_usuario.value === 'locatario') {
			ok_medidor = medidor !== '';
		}

		this.setState({
			senha_invalida: invalid,
			enabled: ok_nome && ok_email && ok_tipo && ok_unidade && ok_senha && ok_medidor
		});
	}

	closeModal() {
		this.setState({
			show_modal: false,
			show_modal_excluir: false,
			editing: false
		});
	}

	editar(item) {
		const newState = {...this.state};

		const {nome, email, senha, senha_invalida, editing, unidades, unidade} = this.state;

		let unidade_value = _.map(unidades, function(m) {
			if (m.id === item.unidade) return m;
		});
		unidade_value = _.without(unidade_value, undefined)[0];

		let tipo_usuario_value = {id: 1, label: 'Administrador', value: 'administrador'};

		let enable_medidor = false;

		if(item.is_locatario) {
			enable_medidor = true;
			tipo_usuario_value = {id: 2, label: 'Locatário', value: 'locatario'};

			let medidores = unidade_value.medidores;

			let medidor_value = _.map(medidores, function(m) {
				if (m.id_medidor === item.id) return m;
			});
			medidor_value = _.without(medidor_value, undefined)[0];

			let medidores_field_value = medidores.map((item, idx) => {
				return {
					'id': item.id_medidor,
					label: item.nome_medidor,
					value: item.id_medidor
				};
			});

			newState.medidor = {
				'id': medidor_value.id_medidor,
				label: medidor_value.nome_medidor,
				value: medidor_value.id_medidor
			};
			newState.medidores = medidores_field_value;

		}

		newState.show_modal = true;
		newState.id_usuario = item.id;
		newState.nome = item.nome;
		newState.email = item.email;
		newState.senha = '';
		newState.senha2 = '';
		newState.unidade = {'id': unidade_value, label: unidade_value.nome, value: unidade_value.id};
		newState.tipo_usuario = tipo_usuario_value;
		newState.ativo = item.ativo;
		newState.editing = true;
		newState.enable_medidor = enable_medidor;
		newState.enabled = email.length > 0 && nome.length > 0 && (senha.length > 0 || editing && !senha_invalida);
		this.setState(newState);
	}

	excluir(item) {
		this.setState({
			show_modal_excluir: true,
			id_usuario: item.id
		});
	}

	handleTipoUsuarioChange(selectedOption) {

		let enable_medidor = selectedOption !== null && selectedOption.value === 'locatario';

		this.setState({
			tipo_usuario: selectedOption,
			enable_medidor: enable_medidor
		}, () => {
			this.validate();
		});
	}

	handleUnidadeChange(selectedOption) {

		let medidores = [];
		if(selectedOption !== null) {
			let unidade = _.map(this.state.unidades, function(u) {
				if (u.id === selectedOption.value) return u;
			});
			unidade = _.without(unidade, undefined)[0];

			medidores = unidade.medidores;

			medidores = medidores.map((item, idx) => {
				return {
					'id': item.id_medidor,
					label: item.nome_medidor,
					value: item.id_medidor
				};
			});
		}

		this.setState({
			unidade: selectedOption,
			medidores: medidores
		}, () => {
			this.validate();
		});
	}

	handleMedidorChange(selectedOption) {

		this.setState({
			medidor: selectedOption
		}, () => {
			this.validate();
		});
	}

	confirmarExclusao() {

		const url = `/register`;

		axios.delete(url, {
			params: {
				'id_usuario': this.state.id_usuario,
				'id_organizacao': this.state.id_organizacao
			}
		})
		.then(response => {
			const newState = {...this.state};
			newState.show_spinner = false;
			newState.show_modal_excluir = false;
			newState.show_notification_excluir = true;
			newState.usuarios = response.data;
			this.setState(newState);
			setTimeout(function() {
				const newState = {...this.state};
				newState.show_notification_excluir = false;
				this.setState(newState);
			}.bind(this), 2000)
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
					<label>Salvando...</label>
				</div>
			);
		}

		let usuarios_list = <div>Nenhum usuário cadastrado</div>;
		if (typeof this.state.usuarios !== 'undefined' && this.state.usuarios.length > 0) {
			let usuarios_rows = this.state.usuarios.map((item, idx) => {

				let ativo = item.ativo ? 'Sim' : 'Não';

				let tipo_usuario = item.is_administrador ? 'Administrador' : 'Locatário';

				let unidade = _.map(this.state.unidades, function(u) {
					if (u.id === item.unidade) return u;
				});
				unidade = _.without(unidade, undefined)[0];

				let medidor_nome = '';
				if(item.is_locatario) {
					let medidores = unidade.medidores;

					let medidor = _.map(medidores, function(u) {
						if (u.id_medidor === item.id) return u;
					});
					medidor = _.without(medidor, undefined)[0];

					medidor_nome = medidor.nome_medidor;
				}


				return (
					<tr className='organizacao-item'>
						<td>{idx + 1}</td>
						<td>
							{item.nome}
						</td>
						<td>
							{item.email}
						</td>
						<td>
							{unidade.nome}
						</td>
						<td>
							{medidor_nome}
						</td>
						<td>
							{tipo_usuario}
						</td>
						<td>
							{ativo}
						</td>
						<td>
							<Button color="success edit-button" onClick={() => this.editar(item)}>
								<i title="Baixar boleto" className="far fa-edit"></i>
							</Button>
							<Button color="danger edit-button" onClick={() => this.excluir(item)}>
								<i title="Baixar boleto" className="fas fa-trash-alt"></i>
							</Button>
						</td>
					</tr>
				)
			});

			usuarios_list = (
				<Table>
					<thead>
					<tr>
						<th>#</th>
						<th>Nome</th>
						<th>Email</th>
						<th>Unidade</th>
						<th>Medidor</th>
						<th>Tipo de Usuário</th>
						<th>Ativo</th>
						<th></th>
					</tr>
					</thead>
					<tbody>
						{usuarios_rows}
					</tbody>
				</Table>
			)
		}

		let unidades = this.state.unidades.map((item, idx) => {
			return {
				'id': idx,
				label: item.nome,
				value: item.id
			};
		});

		let medidor = <div></div>;
		if(this.state.enable_medidor) {
			medidor = <div>
				<Label id="modalidades-label">Selecione o medidor.</Label>
				<Select
					options={this.state.medidores}
					value={this.state.medidor}
					placeholder="Tipo.."
					onChange={this.handleMedidorChange}
					multi={false}
				/>
			</div>;
		}

		return (
			<div className='usuarios'>
				<Alert isOpen={this.state.show_notification} color="success" fade={true}>
					Salvo com sucesso!
				</Alert>
				<Alert isOpen={this.state.show_notification_duplicate} color="danger" fade={true}>
					Já existe um usuário com este email.
				</Alert>
				<Alert isOpen={this.state.show_notification_excluir} color="success" fade={true}>
					Usuário excluído com sucesso!
				</Alert>
				<Modal isOpen={this.state.show_modal} className='modal-lotes'>
					<ModalHeader>Usuário</ModalHeader>
					<ModalBody>
						<Label>Nome</Label>
						<Input type="text" placeholder="Nome da Unidade" value={this.state.nome} onChange={this.updateInputValueNome}/>
						<Label>Email</Label>
						<Input type="text" placeholder="Nome da Unidade" value={this.state.email} onChange={this.updateInputValueEmail}/>

						<Label>Senha</Label>
						<Input type="password" placeholder="Nova senha" value={this.state.senha} onChange={this.updateInputValueSenha}/>
						<Label>Repite sua senha</Label>
						<Input invalid={this.state.senha_invalida} type="password" placeholder="Repita sua senha" value={this.state.senha2} onChange={this.updateInputValueSenha2}/>
						<FormFeedback>As senhas não coincidem</FormFeedback>
						<Label id="modalidades-label">Selecione a unidade.</Label>
						<Select
							options={unidades}
							value={this.state.unidade}
							placeholder="Unidade.."
							onChange={this.handleUnidadeChange}
							multi={false}
						/>
						<Label id="modalidades-label">Selecione o tipo de usuário.</Label>
						<Select
							options={TIPO_USUARIO.TIPO_USUARIO}
							value={this.state.tipo_usuario}
							placeholder="Tipo.."
							onChange={this.handleTipoUsuarioChange}
							multi={false}
						/>
						{medidor}
						<FormGroup check>
							<Label check>
								<Input checked={this.state.ativo} onChange={this.updateInputValueAtivo} type="checkbox" />{' '}
								Usuário ativo
							</Label>
						</FormGroup>
					</ModalBody>
					<ModalFooter>
						<Button id='historico-button' disabled={!this.state.enabled} className='salvar-button' color="success" onClick={this.salvar.bind(this, null)}>Salvar</Button>
						<Button color="primary" onClick={this.closeModal.bind(this, null)}>Fechar</Button>{' '}
					</ModalFooter>
				</Modal>
				<Modal isOpen={this.state.show_modal_excluir} className='modal-lotes'>
					<ModalHeader>Usuário</ModalHeader>
					<ModalBody>
						<Label>Tem certeza que deseja excluir?</Label>
					</ModalBody>
					<ModalFooter>
						<Button id='historico-button' className='salvar-button' color="danger" onClick={this.confirmarExclusao.bind(this, null)}>Excluir</Button>
						<Button color="primary" onClick={this.closeModal.bind(this, null)}>Fechar</Button>{' '}
					</ModalFooter>
				</Modal>
				{spinner}
				<Card>
					<CardHeader className='item-card-header'>
						Usuários
					</CardHeader>
					<CardBody>
						{usuarios_list}
						<Button id='historico-button' className='credencial-button' color="primary" onClick={this.adicionarLinha.bind(this, null)}>Adicionar novo usuário</Button>
					</CardBody>
				</Card>
			</div>
		)
	}
}

export default UsuariosAdmin;
