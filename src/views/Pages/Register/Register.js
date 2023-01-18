import React, { Component } from 'react';
import { Button, Card, CardBody, CardFooter, Col, Container, Form, Input, InputGroup, InputGroupAddon, InputGroupText, Row , FormFeedback} from 'reactstrap';
import axios from 'axios'

class Register extends Component {

	constructor(props) {
		super(props);

		this.state = {
			login: '',
			senha: '',
			senha2: '',
			email: '',
			invalid: false,
			show_notification: false,
			show_notification_error: false,
			enable_button: false,
			searching: false
		};

		this.register = this.register.bind(this);
		this.updateInputValueSenha = this.updateInputValueSenha.bind(this);
		this.updateInputValueSenha2 = this.updateInputValueSenha2.bind(this);
		this.updateInputValueEmail = this.updateInputValueEmail.bind(this);
		this.updateInputValueLogin = this.updateInputValueLogin.bind(this);
		this.handleKeyPress = this.handleKeyPress.bind(this);
	}

	componentDidMount() {

		setTimeout(function() {
			const newState = {...this.state};
			newState.show_notification_nova_senha = false;
			this.setState(newState);
		}.bind(this), 3000)
	}

	register() {

		const newState = {...this.state};
		newState.searching = true;
		this.setState(newState);

		const params = new URLSearchParams();
		params.append('username', this.state.login);
		params.append('email', this.state.email);
		params.append('senha', this.state.senha);

		const url = `/register`;
		axios.post(url, params)
			.then(response => {
				const newState = {...this.state};
				newState.show_notification = true;
				newState.searching = false;
				this.setState(newState);

				this.props.history.push({
					pathname: '/login'
				});
			}).catch(error => {
				const newState = {...this.state};
				newState.searching = false;
				newState.show_notification_error = true;
				this.setState(newState);
		});
	}

	updateInputValueEmail(event) {
		let {senha, senha2, login} = this.state;
		let invalid = senha2.length !== 0 && senha2 !== senha;
		let email = event.target.value;

		this.setState({
			email: event.target.value,
			enable_button: !invalid && senha2.length > 0 && email.length > 0 && login.length > 0
		});
	}

	updateInputValueLogin(event) {
		let {senha, senha2, email} = this.state;
		let invalid = senha2.length !== 0 && senha2 !== senha;
		let login = event.target.value;

		this.setState({
			login: event.target.value,
			enable_button: !invalid && senha2.length > 0 && email.length > 0 && login.length > 0
		});
	}

	updateInputValueSenha(event) {
		let {email, senha2, login} = this.state;
		let senha = event.target.value;
		let invalid = senha2.length !== 0 && senha2 !== senha;

		this.setState({
			senha: event.target.value,
			enable_button: !invalid && senha2.length > 0 && email.length > 0 && login.length > 0
		});
	}

	updateInputValueSenha2(event) {

		let {senha, email, login} = this.state;
		let senha2 = event.target.value;
		let invalid = senha2.length !== 0 && senha2 !== senha;

		this.setState({
			senha2: senha2,
			senha: senha,
			invalid: invalid,
			enable_button: !invalid && senha2.length > 0 && email.length > 0 && login.length > 0
		});
	}

	handleKeyPress(event) {
		if (event.key === 'Enter') {
			this.register();
		}
	}

  render() {

	  const {invalid} = this.state;

		return (
		  <div className="app flex-row align-items-center">
			<Container>
			  <Row className="justify-content-center">
				<Col md="9" lg="7" xl="6">
				  <Card className="mx-4">
					<CardBody className="p-4">
					  <Form>
						<h1>Nova conta</h1>
						<p className="text-muted">Crie sua conta</p>
						<InputGroup className="mb-3">
						  <InputGroupAddon addonType="prepend">
							<InputGroupText>
							  <i className="icon-user"></i>
							</InputGroupText>
						  </InputGroupAddon>
						  <Input type="text" placeholder="Nome" autoComplete="username" value={this.state.login} onChange={this.updateInputValueLogin}/>
						</InputGroup>
						<InputGroup className="mb-3">
						  <InputGroupAddon addonType="prepend">
							<InputGroupText>@</InputGroupText>
						  </InputGroupAddon>
						  <Input type="text" placeholder="Email" autoComplete="email" value={this.state.email} onChange={this.updateInputValueEmail}/>
						</InputGroup>
						<InputGroup className="mb-3">
						  <InputGroupAddon addonType="prepend">
							<InputGroupText>
							  <i className="icon-lock"></i>
							</InputGroupText>
						  </InputGroupAddon>
						  <Input type="password" placeholder="Senha" autoComplete="new-password" value={this.state.senha} onChange={this.updateInputValueSenha}/>
						</InputGroup>
						<InputGroup className="mb-4">
						  <InputGroupAddon addonType="prepend">
							<InputGroupText>
							  <i className="icon-lock"></i>
							</InputGroupText>
						  </InputGroupAddon>
						  <Input invalid={invalid} type="password" placeholder="Repita sua senha" autoComplete="new-password" value={this.state.senha2} onChange={this.updateInputValueSenha2}/>
							<FormFeedback>As senhas não coincidem</FormFeedback>
						</InputGroup>
						<Button
							color="success"
							block
							disabled={!this.state.enable_button}
							onClick={this.register}>Criar conta</Button>
					  </Form>
					</CardBody>
				  </Card>
				</Col>
			  </Row>
			</Container>
		  </div>
		);
  }
}

export default Register;
