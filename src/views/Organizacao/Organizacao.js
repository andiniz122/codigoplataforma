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
	Button, Input,
	Modal, ModalFooter, ModalBody, ModalHeader
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


class Organizacao extends Component {

	constructor (props) {
		super(props);
		this.state = {
			show_spinner: false,
			show_notification: false,
			show_notification_duplicate: false,
			enabled: false,
			organizacao_name: '',
			organizacao_id: '',
			organizacoes: [],
			show_modal: false,
			show_modal_excluir: false
		};

		this.adicionarLinha = this.adicionarLinha.bind(this);
		this.updateInputValue = this.updateInputValue.bind(this);
		this.salvar = this.salvar.bind(this);
		this.confirmarExclusao = this.confirmarExclusao.bind(this);
		this.showModalExcluir = this.showModalExcluir.bind(this);
	}

	componentDidMount() {

		const newState = {...this.state};
		newState.show_spinner = true;
		this.setState(newState);

		axios.get('/organizacao')
			.then(response => {
				const newState = {...this.state};
				newState.organizacoes = response.data.organizacoes;
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

		if(newState.organizacoes.includes(this.state.organizacao_name)) {
			newState.show_notification_duplicate = true;

			setTimeout(function() {
				const newState = {...this.state};
				newState.show_notification_duplicate = false;
				this.setState(newState);
			}.bind(this), 2000)
		}

		newState.show_modal = false;
		newState.organizacao_name = '';
		newState.show_spinner = true;

		const params = new URLSearchParams();
		params.append('nome', this.state.organizacao_name);

		const url = `/organizacao`;
		axios.post(url, params)
			.then(response => {
				const newState = {...this.state};
				newState.show_spinner = false;
				newState.show_notification = true;
				newState.organizacoes = response.data.organizacoes;
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

		this.setState(newState);
	}

	adicionarLinha() {
		const newState = {...this.state};
		newState.show_modal = true;
		this.setState(newState);
	}

	navigateOrganizacao(item) {
		window.location = `/#/organizacao/unidades?id_organizacao=${item.id}`;
	}

	navigateUsuarios(item) {
		window.location = `/#/organizacao/usuarios?id_organizacao=${item.id}`;
	}

	updateInputValue(event) {

		let organizacao_name = event.target.value;

		this.setState({
			organizacao_name: organizacao_name,
			enabled: organizacao_name.length > 0
		});
	}

	closeModal() {
		this.setState({
			show_modal: false,
			show_modal_excluir: false
		});
	}

	confirmarExclusao() {

		const url = `/organizacao`;
		axios.delete(url, {
			params: {
				'organizacao_id': this.state.organizacao_id
			}
		})
		.then(response => {
			const newState = {...this.state};
			newState.show_spinner = false;
			newState.show_notification = true;
			newState.show_modal_excluir = false;
			newState.organizacoes = response.data.organizacoes;
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

	showModalExcluir(item) {
		const newState = {...this.state};
		newState.show_modal_excluir = true;
		newState.organizacao_id = item.id;
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
					<label>Salvando...</label>
				</div>
			);
		}

		let organizacao_list = <div>Nenhuma organização cadastrada</div>;
		if (typeof this.state.organizacoes !== 'undefined' && this.state.organizacoes.length > 0) {
			let organizacao_rows = this.state.organizacoes.map((item, idx) => {

				return (
					<tr className='organizacao-item'>
						<td>{idx + 1}</td>
						<td>
							{item.nome}
						</td>
						<td>
							{item.token}
						</td>
						<td>
							<Button color="primary edit-button" onClick={() => this.navigateOrganizacao(item)}>
								<i title="Editar" className="far fa-edit"></i>
							</Button>
							<Button color="success edit-button" onClick={() => this.navigateUsuarios(item)}>
								<i title="Usuários" className="fas fa-users"></i>
							</Button>
							<Button color="danger edit-button" onClick={() => this.showModalExcluir(item)}>
								<i title="Excluir" className="far fa-trash-alt"></i>
							</Button>
						</td>
					</tr>
				)
			});

			organizacao_list = (
				<Table>
					<thead>
					<tr>
						<th>#</th>
						<th>Nome da organização</th>
						<th>Token de autenticação</th>
						<th></th>
					</tr>
					</thead>
					<tbody>
						{organizacao_rows}
					</tbody>
				</Table>
			)
		}

		return (
			<div className='organizacao'>
				<Alert isOpen={this.state.show_notification} color="success" fade={true}>
					Salvo com sucesso!
				</Alert>
				<Alert isOpen={this.state.show_notification_duplicate} color="danger" fade={true}>
					Já existe uma organização com este nome.
				</Alert>
				<Modal isOpen={this.state.show_modal} className='modal-lotes'>
					<ModalHeader>Organização</ModalHeader>
					<ModalBody>
						<Input type="text" placeholder="Nome da Organização" value={this.state.organizacao_name} onChange={this.updateInputValue}/>
					</ModalBody>
					<ModalFooter>
						<Button id='historico-button' disabled={!this.state.enabled} className='salvar-button' color="success" onClick={this.salvar.bind(this, null)}>Salvar</Button>
						<Button color="primary" onClick={this.closeModal.bind(this, null)}>Fechar</Button>{' '}
					</ModalFooter>
				</Modal>
				<Modal isOpen={this.state.show_modal_excluir} className='modal-lotes'>
					<ModalHeader>Organização</ModalHeader>
					<ModalBody>
						<label>Deseja excluir esta organização?</label>
					</ModalBody>
					<ModalFooter>
						<Button id='historico-button' className='salvar-button' color="danger" onClick={this.confirmarExclusao.bind(this, null)}>Confirmar exclusão</Button>
						<Button color="primary" onClick={this.closeModal.bind(this, null)}>Fechar</Button>{' '}
					</ModalFooter>
				</Modal>
				{spinner}
				<Card>
					<CardHeader className='item-card-header'>
						Organizações
					</CardHeader>
					<CardBody>
						{organizacao_list}
						<Button id='historico-button' className='credencial-button' color="primary" onClick={this.adicionarLinha.bind(this, null)}>Adicionar nova organização</Button>
					</CardBody>
				</Card>
			</div>
		)
	}
}

export default Organizacao;
