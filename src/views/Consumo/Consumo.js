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
	Modal, ModalFooter, ModalBody, ModalHeader, ListGroup, ListGroupItem, Alert
} from 'reactstrap';

import Joyride, {STATUS} from 'react-joyride';
import TreeViewMenu from 'react-simple-tree-menu';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import moment from 'moment';

import {Bar} from "react-chartjs-2";
import {DotLoader} from "react-spinners";

const DEFAULT_PADDING = 16;
const ICON_SIZE = 12;
const LEVEL_SPACE = 16;

const SEMANAS = require('../../data/semanas');


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

class Consumo extends Component {

    constructor(props) {
        super(props);

		this.state = {
			show_spinner: false,
			show_notification_medidor: false,
			show_notification_ano: false,
			chart_title: '',
			granularidade_options: [],
			granularidade: '',
			views: ['multi', 'ano', 'mes', 'semana', 'dia', 'custom'],
			anos: ['2019'],
			ano: '',
			mes: '',
			semana_selected: '',
			date_selected: new Date(),
			dt_de: new Date(),
			dt_ate: new Date(),
			total: '',
			medidor_id: '',
			view_selected: '',
			data: {},
			treeData: {}
		};

		this.update = this.update.bind(this);
		this.handleGranularidadeChange = this.handleGranularidadeChange.bind(this);
		this.handleMultiAno = this.handleMultiAno.bind(this);
		this.handleAno = this.handleAno.bind(this);
		this.handleMes = this.handleMes.bind(this);
		this.handleSemana = this.handleSemana.bind(this);
		this.handleDia = this.handleDia.bind(this);
		this.handleCustom = this.handleCustom.bind(this);
		this.handleDataChange = this.handleDataChange.bind(this);
		this.handleSemanaChange = this.handleSemanaChange.bind(this);
		this.handleAnoChange = this.handleAnoChange.bind(this);
		this.handleDateChange = this.handleDateChange.bind(this);
		this.handleDateDeChange = this.handleDateDeChange.bind(this);
		this.handleDateAteChange = this.handleDateAteChange.bind(this);
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

		url = `/dashboard-params`;

		axios.get(url)
			.then(response => {
				const newState = {...this.state};
				newState.anos = response.data.years;
				newState.weeks = response.data.weeks;
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

		let medidor_clicked = props.type === 'medidor';

		if(medidor_clicked) {
			newState.medidor_id = props.medidor_id;
		}

		this.setState(newState);
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

	handleGranularidadeChange(selectedOption) {
		const newState = {...this.state};
		newState.granularidade = selectedOption;
		this.setState(newState);
	}

	handleMultiAno() {
		const newState = {...this.state};
		newState.view_selected = 'multi';
		newState.granularidade_options = [
			{id: 1, label: 'Ano', value: 'Ano'},
			{id: 2, label: 'Mês', value: 'Mês'},
		];

		newState.chart_title = 'Anual Valores';
		newState.granularidade = {id: 1, label: 'Ano', value: 'Ano'};
		this.setState(newState, () => {
			this.handleDataChange('2019');
		});
	}

	handleAno() {
		const newState = {...this.state};
		newState.view_selected = 'ano';
		newState.granularidade_options = [
			{id: 1, label: 'Dia', value: 'dia'},
			{id: 2, label: 'Mês', value: 'mes'},
		];

		newState.data = {
			labels: [],
			datasets: [
				{
					label: 'Consumo kWh',
					backgroundColor: 'rgba(47, 236, 110,0.2)',
					borderColor: 'rgba(35, 184, 84,1)',
					borderWidth: 1,
					hoverBackgroundColor: 'rgba(35, 184, 84,0.4)',
					hoverBorderColor: 'rgba(24, 125, 57,1)',
					data: []
				},
			]
		};
		newState.chart_title = 'Mensal Valores';
		newState.ano = '';
		newState.granularidade = {id: 1, label: 'Dia', value: 'Dia'};
		this.setState(newState);
	}

	handleMes() {
		const newState = {...this.state};
		newState.view_selected = 'mes';
		newState.granularidade_options = [
			{id: 1, label: 'Dia', value: 'Dia'},
			{id: 2, label: 'Hora', value: 'Hora'},
		];
		newState.data = {
			labels: [],
			datasets: [
				{
					label: 'Consumo kWh',
					backgroundColor: 'rgba(47, 236, 110,0.2)',
					borderColor: 'rgba(35, 184, 84,1)',
					borderWidth: 1,
					hoverBackgroundColor: 'rgba(35, 184, 84,0.4)',
					hoverBorderColor: 'rgba(24, 125, 57,1)',
					data: []
				},
			]
		};
		newState.ano = '';
		newState.chart_title = 'Diário Valores';
		newState.granularidade = {id: 1, label: 'Dia', value: 'Dia'};
		this.setState(newState);
	}

	handleSemana() {
		const newState = {...this.state};
		newState.view_selected = 'semana';
		newState.granularidade_options = [
			{id: 1, label: 'Dia', value: 'Dia'},
			{id: 2, label: 'Hora', value: 'Hora'},
			{id: 3, label: '30min', value: '30min'},
		];
		newState.data = {
			labels: [],
			datasets: [
				{
					label: 'Consumo kWh',
					backgroundColor: 'rgba(47, 236, 110,0.2)',
					borderColor: 'rgba(35, 184, 84,1)',
					borderWidth: 1,
					hoverBackgroundColor: 'rgba(35, 184, 84,0.4)',
					hoverBorderColor: 'rgba(24, 125, 57,1)',
					data: []
				},
			]
		};
		newState.ano = '';
		newState.chart_title = 'Semana Valores';
		newState.granularidade = {id: 1, label: 'Dia', value: 'Dia'};
		this.setState(newState);
	}

	handleDia() {
		const newState = {...this.state};
		newState.view_selected = 'dia';
		newState.granularidade_options = [
			{id: 1, label: 'Dia', value: 'Dia'},
			{id: 2, label: 'Hora', value: 'Hora'},
			{id: 3, label: '30min', value: '30min'},
			{id: 3, label: '15min', value: '15min'},
			{id: 3, label: '5min', value: '5min'},
		];
		newState.data = {
			labels: [],
			datasets: [
				{
					label: 'Consumo kWh',
					backgroundColor: 'rgba(47, 236, 110,0.2)',
					borderColor: 'rgba(35, 184, 84,1)',
					borderWidth: 1,
					hoverBackgroundColor: 'rgba(35, 184, 84,0.4)',
					hoverBorderColor: 'rgba(24, 125, 57,1)',
					data: []
				},
			]
		};
		newState.chart_title = '1hr Valores';
		newState.startDate = '';
		newState.granularidade = {id: 1, label: 'Dia', value: 'Dia'};
		this.setState(newState);
	}

	handleCustom() {
		const newState = {...this.state};
		newState.view_selected = 'custom';
		newState.granularidade_options = [
			{id: 1, label: 'Dia', value: 'Dia'},
			{id: 2, label: 'Hora', value: 'Hora'},
			{id: 3, label: '30min', value: '30min'},
			{id: 3, label: '15min', value: '15min'},
			{id: 3, label: '5min', value: '5min'},
		];
		newState.data = {
			labels: [],
			datasets: [
				{
					label: 'Consumo kWh',
					backgroundColor: 'rgba(47, 236, 110,0.2)',
					borderColor: 'rgba(35, 184, 84,1)',
					borderWidth: 1,
					hoverBackgroundColor: 'rgba(35, 184, 84,0.4)',
					hoverBorderColor: 'rgba(24, 125, 57,1)',
					data: []
				},
			]
		};
		newState.granularidade = {id: 1, label: 'Dia', value: 'Dia'};
		this.setState(newState);
	}

	handleDataChange(params) {

    	if(this.state.medidor_id === '') {
			const newState = {...this.state};
			newState.show_notification_medidor = true;
			this.setState(newState);

			setTimeout(function() {
				const newState = {...this.state};
				newState.show_notification_medidor = false;
				this.setState(newState);
			}.bind(this), 2000);
			return;
		} else if((this.state.view_selected === 'mes' || this.state.view_selected === 'semana') && this.state.ano === '') {
			const newState = {...this.state};
			newState.show_notification_ano = true;
			this.setState(newState);

			setTimeout(function() {
				const newState = {...this.state};
				newState.show_notification_ano = false;
				this.setState(newState);
			}.bind(this), 2000);
			return;
		}

		let ano = params['ano'];
		let mes = params['mes'];

		const newState = {...this.state};
		if(ano !== undefined) {
			newState.ano = ano;
		}
		newState.show_spinner = true;
		newState.mes = mes;
		this.setState(newState, () => {
			let url = `/dashboard`;

			axios.get(url, {
				params: {
					'id_medidor': this.state.medidor_id,
					'view': this.state.view_selected,
					'granularidade': this.state.granularidade,
					'ano': this.state.ano,
					'mes': this.state.mes,
					'semana': this.state.semana_selected,
					'data_selected': this.state.date_selected,
					'start_date': this.state.dt_de,
					'end_date': this.state.dt_ate,
				}
			})
			.then(response => {

				const data = {
					labels: response.data.x_axis,
					datasets: [
						{
							label: 'Consumo kWh',
							backgroundColor: 'rgba(47, 236, 110,0.2)',
							borderColor: 'rgba(35, 184, 84,1)',
							borderWidth: 1,
							hoverBackgroundColor: 'rgba(35, 184, 84,0.4)',
							hoverBorderColor: 'rgba(24, 125, 57,1)',
							data: response.data.y_axis
						},
					]
				};

				const newState = {...this.state};
				newState.data = data;
				newState.total = response.data.sum;
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
		});


	}

	handleSemanaChange(selectedOption) {

		this.setState({
			semana_selected: selectedOption
		}, () => {
			this.handleDataChange({});
		});
	}

	multiAnoLayout() {
		return <div>

		</div>;
	}

	anoLayout() {
    	let anos = this.state.anos.map(ano => {
			return <div className='time-options-line'>
				<label className={this.state.ano === ano ? 'active' : ''} onClick={this.handleDataChange.bind(this, {'ano': ano})}><span>{ano}</span></label>
			</div>
		});
		return <div className='time-options'>
			{anos}
		</div>;
	}

	handleAnoChange(ano) {
    	const newState = {...this.state};
		newState.ano = ano.ano;
		this.setState(newState);
	}

	handleDateChange(event) {
		const newState = {...this.state};
		newState.date_selected = event;
		this.setState(newState, () => {
			this.handleDataChange({});
		});
	}

	handleDateDeChange(event) {
		const newState = {...this.state};
		newState.dt_de = event;
		this.setState(newState, () => {
			this.handleDataChange({});
		});
	}

	handleDateAteChange(event) {
		const newState = {...this.state};
		newState.dt_ate = event;
		this.setState(newState, () => {
			this.handleDataChange({});
		});
	}

	mesLayout() {

		let anos = this.state.anos.map(ano => {
			return <div className='time-options-line'>
				<label className={this.state.ano === ano ? 'active' : ''} onClick={this.handleAnoChange.bind(this, {'ano': ano})}><span>{ano}</span></label>
			</div>
		});

		return <div>
			<div className='time-options'>
				<div className='time-margin'>
					{anos}
				</div>

				<div className='time-options-line-mes'>
					<label className={this.state.mes === 'jan' ? 'active' : ''} onClick={this.handleDataChange.bind(this, {'mes': 'jan'})}><span>Jan</span></label>
					<label className={this.state.mes === 'fev' ? 'active' : ''} onClick={this.handleDataChange.bind(this, {'mes': 'fev'})}><span>Fev</span></label>
					<label className={this.state.mes === 'mar' ? 'active' : ''} onClick={this.handleDataChange.bind(this, {'mes': 'mar'})}><span>Mar</span></label>
					<label className={this.state.mes === 'abr' ? 'active' : ''} onClick={this.handleDataChange.bind(this, {'mes': 'abr'})}><span>Abr</span></label>
				</div>
				<div className='time-options-line-mes'>
					<label className={this.state.mes === 'mai' ? 'active' : ''} onClick={this.handleDataChange.bind(this, {'mes': 'mai'})}><span>Mai</span></label>
					<label className={this.state.mes === 'jun' ? 'active' : ''} onClick={this.handleDataChange.bind(this, {'mes': 'jun'})}><span>Jun</span></label>
					<label className={this.state.mes === 'jul' ? 'active' : ''} onClick={this.handleDataChange.bind(this, {'mes': 'jul'})}><span>Jul</span></label>
					<label className={this.state.mes === 'ago' ? 'active' : ''} onClick={this.handleDataChange.bind(this, {'mes': 'ago'})}><span>Ago</span></label>
				</div>
				<div className='time-options-line-mes'>
					<label className={this.state.mes === 'set' ? 'active' : ''} onClick={this.handleDataChange.bind(this, {'mes': 'set'})}><span>Set</span></label>
					<label className={this.state.mes === 'out' ? 'active' : ''} onClick={this.handleDataChange.bind(this, {'mes': 'out'})}><span>Out</span></label>
					<label className={this.state.mes === 'nov' ? 'active' : ''} onClick={this.handleDataChange.bind(this, {'mes': 'nov'})}><span>Nov</span></label>
					<label className={this.state.mes === 'dez' ? 'active' : ''} onClick={this.handleDataChange.bind(this, {'mes': 'dez'})}><span>Dez</span></label>
				</div>
			</div>
		</div>;
	}

	semanaLayout() {

		let anos = this.state.anos.map(ano => {
			return <div className='time-options-line'>
				<label className={this.state.ano === ano ? 'active' : ''} onClick={this.handleAnoChange.bind(this, {'ano': ano})}><span>{ano}</span></label>
			</div>
		});

		return <div className='time-options'>
			<div className='time-options-line time-margin'>
				{anos}
			</div>
			<label>Semana número:</label>
			<Select
				options={SEMANAS.SEMANAS}
				value={this.state.semana_selected}
				placeholder="Semana..."
				onChange={this.handleSemanaChange}
				multi={false}
			/>
		</div>;
	}

	diaLayout() {
		return <div>
			<label>Dia:</label>
			<DatePicker
				className='date-field'
				selected={this.state.date_selected}
				onChange={this.handleDateChange}
				dateFormat="dd/MM/yyyy"
				locale="pt-BR"
			/>
		</div>;
	}

	customLayout() {
		return <div>
			<label>De:</label>
			<DatePicker
				className='date-field'
				selected={this.state.dt_de}
				onChange={this.handleDateDeChange}
				dateFormat="dd/MM/yyyy"
				locale="pt-BR"
			/>
			<br/>
			<label>Ate:</label>
			<DatePicker
				className='date-field'
				selected={this.state.dt_ate}
				onChange={this.handleDateAteChange}
				dateFormat="dd/MM/yyyy"
				locale="pt-BR"
			/>
		</div>;
	}

    render() {

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

		let plugins = [{
			afterDraw: (chart, easing) => {
				const ctx = chart.chart.ctx;

				ctx.fillStyle = 'black';
				ctx.strokeStyle = 'black';

				const scaleX = chart.scales['x-axis-0'];
				const scaleY = chart.scales['y-axis-0'];

				console.log(scaleX);
				console.log(scaleY);

				ctx.fillStyle = 'rgba(24, 125, 57,1)';
				ctx.strokeStyle = 'rgba(24, 125, 57,1)';

				ctx.fillText(`Consumo Total: ${this.state.total} Kwh`, scaleX.left + 10, scaleY.top - 15);

				ctx.save();
				ctx.beginPath();
				ctx.moveTo(scaleX.left, 550);
				ctx.lineTo(scaleX.right, 550);
				ctx.lineWidth = 2;
				ctx.stroke();
				ctx.restore();
			}
		}];

        return (
            <div className="animated fadeIn consumo">
				<Alert isOpen={this.state.show_notification_medidor} color="danger" fade={true}>
					Selecione um medidor!
				</Alert>
				<Alert isOpen={this.state.show_notification_ano} color="danger" fade={true}>
					Selecione o ano.
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
						<Card id='faturas'>
							<CardHeader>
								Consumo
							</CardHeader>
							<CardBody>

								{/*Granularidade:*/}
								{/*<Select*/}
									{/*options={this.state.granularidade_options}*/}
									{/*value={this.state.granularidade}*/}
									{/*placeholder="Tipo.."*/}
									{/*onChange={this.handleGranularidadeChange}*/}
									{/*multi={false}*/}
								{/*/>*/}

								<h2>Filtros</h2>

								<Row>
									<Col xs="6" sm="6">
										<div className='time-options'>
											<div className='time-options-line'>
												<label className={this.state.view_selected === 'multi' ? 'active' : ''} onClick={this.handleMultiAno.bind(this, null)}><span>Multi ano</span></label>
												<label className={this.state.view_selected === 'ano' ? 'active' : ''} onClick={this.handleAno.bind(this, null)}><span>Ano</span></label>
											</div>
											<div className='time-options-line'>
												<label className={this.state.view_selected === 'mes' ? 'active' : ''} onClick={this.handleMes.bind(this, null)}><span>Mês</span></label>
												<label className={this.state.view_selected === 'semana' ? 'active' : ''} onClick={this.handleSemana.bind(this, null)}><span>Semana</span></label>
											</div>
											<div className='time-options-line'>
												<label className={this.state.view_selected === 'dia' ? 'active' : ''} onClick={this.handleDia.bind(this, null)}><span>Dia</span></label>
												<label className={this.state.view_selected === 'custom' ? 'active' : ''} onClick={this.handleCustom.bind(this, null)}><span>De/Até</span></label>
											</div>
										</div>
									</Col>
									<Col xs="6" sm="6">
										{this.state.view_selected === 'multi' ? this.multiAnoLayout() : <div></div>}
										{this.state.view_selected === 'ano' ? this.anoLayout() : <div></div>}
										{this.state.view_selected === 'mes' ? this.mesLayout() : <div></div>}
										{this.state.view_selected === 'semana' ? this.semanaLayout() : <div></div>}
										{this.state.view_selected === 'dia' ? this.diaLayout() : <div></div>}
										{this.state.view_selected === 'custom' ? this.customLayout() : <div></div>}
									</Col>
									<div className='separator'></div>
								</Row>
								<Row>
									<h2>{this.state.chart_title}</h2>
								</Row>
								<Row>
									{spinner}
								</Row>
								<Row>
									<Bar
										data={this.state.data}
										height={500}
										plugins={plugins}
										options={{
											maintainAspectRatio: false
										}}
									/>
								</Row>
							</CardBody>
						</Card>
					</Col>
				</Row>
            </div>
        );
    }
}

export default Consumo;
