import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {
	Button,
	Card,
	CardBody,
	CardGroup,
	Col,
	Container,
	Form,
	Input,
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	UncontrolledAlert,
	ModalBody,
	ModalHeader,
	ModalFooter,
	Row,
} from 'reactstrap';

import axios from 'axios'

class Login extends Component {

	constructor(props) {
		super(props);

		this.state = {
			login: '',
			senha: '',
			show_notification: false
		};

		this.doLogin = this.doLogin.bind(this);
		this.updateInputValueLogin = this.updateInputValueLogin.bind(this);
		this.updateInputValueSenha = this.updateInputValueSenha.bind(this);
		this.onDismiss = this.onDismiss.bind(this);
	}

	doLogin(x) {

		const newState = {...this.state};
		this.setState(newState);

		const login = this.state.login;
		const senha = this.state.senha;

		const params = new URLSearchParams();
		params.append('username', login);
		params.append('password', senha);

		const url = `/login`;
		axios.post(url, params)
			.then(response => {

				const accessToken = response.data.token;
				axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
				axios.defaults.headers.common['UserId'] = response.data.login;

				this.storeSessionData(response.data);
				this.props.updateLoggedState(response, this.props.history);
			}).catch(error => {
			newState.show_notification = true;
			this.setState(newState);
		});
	}

	storeSessionData(data) {
		localStorage.setItem('login-data', JSON.stringify(data));
	}

	updateInputValueLogin(event) {
		this.setState({
			login: event.target.value,
			senha: this.state.senha
		});
	}

	updateInputValueSenha(event) {
		this.setState({
			login: this.state.login,
			senha: event.target.value
		});
	}

	onDismiss() {
		let loginData = JSON.parse(localStorage.getItem('login-data'));
		loginData.ok = null;
		localStorage.setItem('login-data', JSON.stringify(loginData));

		const newState = {...this.state};
		newState.show_notification = false;
		this.setState(newState);
	}

	render() {

		let alert = <div></div>;

		if (this.state.show_notification) {
			alert = (
				<UncontrolledAlert color="danger">
					Usuário ou senha incorretos!
				</UncontrolledAlert>
			);
		}

		return (
			<div className="app flex-row align-items-center login">
				{alert}
				<Container>
					<Row className="justify-content-center">
						<Col md="8">
							<CardGroup>
								<Card className="p-4">
									<CardBody>
										<Form>
											<h1>Login</h1>
											<p className="text-muted">Faça o login para acessar sua conta.</p>
											<InputGroup className="mb-3">
												<InputGroupAddon addonType="prepend">
													<InputGroupText>
														<i className="icon-user"></i>
													</InputGroupText>
												</InputGroupAddon>
												<Input type="text" placeholder="Nome de usuário" autoComplete="username"
													   value={this.state.login} onChange={this.updateInputValueLogin}/>
											</InputGroup>
											<InputGroup className="mb-4">
												<InputGroupAddon addonType="prepend">
													<InputGroupText>
														<i className="icon-lock"></i>
													</InputGroupText>
												</InputGroupAddon>
												<Input type="password" placeholder="Senha"
													   autoComplete="current-password" value={this.state.senha}
													   onChange={this.updateInputValueSenha}/>
											</InputGroup>
											<Row>
												<Col xs="4">
													<Button
														color="primary"
														className="px-4"
														onClick={this.doLogin}
														onSubmit={this.doLogin}
													>Login</Button>
												</Col>
												<Col xs="8" className="text-right">
													<Button color="link" className="px-0"
															href="/#/new-password-request">Esqueci minha senha</Button>
												</Col>
											</Row>
										</Form>
									</CardBody>
								</Card>
							</CardGroup>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}

export default Login;
