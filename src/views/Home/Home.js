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
import navigation from "../../_nav";


class Home extends Component {

	constructor (props) {
		super(props);

		this.state = {
			show_spinner: false,
			show_error_notification: false,
			unidade_id: '',
			unidades_options: [],
			unidades: '',
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

		axios.get('/home')
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

	handleUnidadeChange(selectedOption) {

		this.setState({
			unidade: selectedOption,
			show_spinner: true
		});

		let url = `/home`;

		axios.get(url,{
			params: {
				'id_unidade': selectedOption !== null ? selectedOption.id : ''
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

				let icon_medidor = 'fas fa-bolt';
				if (item.natureza === 2) {
					icon_medidor = 'fas fa-tint';
				}
				return (
					<Card className='card-medidor'>
						<CardHeader>
							Medidor {item.nome}
							<br/>
							{item.tipo}
							<i className={icon_medidor}></i>
						</CardHeader>
						<CardBody>
							<h5>Valores até o momento:</h5>
							<h3></h3>
							<h3>{item.valor} {item.unidade}</h3>
						</CardBody>
					</Card>
				)
			});
		}

		let select_unidade = <div></div>;
		let loginData = JSON.parse(localStorage.getItem('login-data'));
		if(loginData !== null && loginData.is_admin) {
			select_unidade = <div>
				<label>Selecione a unidade</label>
				<Select
					className='select-unidade'
					options={this.state.unidades_options}
					value={this.state.unidade}
					placeholder="Unidade.."
					onChange={this.handleUnidadeChange}
					multi={false}
				/>
			</div>;
		}

		return (
			<div className='home'>
				{spinner}
				<Alert isOpen={this.state.show_error_notification} color="danger" fade={true}>
					Selecione uma unidade!
				</Alert>
				<Row>
					{select_unidade}
				</Row>
				<Row>
					{leituras_list}
				</Row>
			</div>
		)
	}
}

export default Home;
