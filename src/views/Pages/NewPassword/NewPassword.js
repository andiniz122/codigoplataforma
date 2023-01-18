import React, {Component} from 'react';

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
	Alert,
	InputGroupText,
	Row,
	FormFeedback
} from 'reactstrap';

import axios from 'axios';

import {DotLoader} from 'react-spinners';

class NewPassword extends Component {

	constructor(props) {
		super(props);

		this.state = {
			invalid: false,
			senha: '',
			senha2: '',
			show_spinner: false,
			show_notification: false,
			show_notification_error: false,
			searching: false,
			enable_button: false
		};

		this.changePassword = this.changePassword.bind(this);
		this.updateInputValueSenha = this.updateInputValueSenha.bind(this);
		this.updateInputValueSenha2 = this.updateInputValueSenha2.bind(this);
		this.onDismiss = this.onDismiss.bind(this);
		this.handleKeyPress = this.handleKeyPress.bind(this);
	}

	changePassword(x) {

		let id = '';
		if (this.props.location) {
			let queryParams = this.props.location.search;
			id = queryParams.split('=')[1];
		}

		const newState = {...this.state};
		newState.searching = true;
		this.setState(newState);

		const url = `/password-reset?id=${id}&new_pass=${this.state.senha}`;
		axios.post(url)
			.then(response => {
				const newState = {...this.state};
				newState.show_notification = true;
				newState.searching = false;
				this.setState(newState);

				this.props.history.push({
					pathname: '/login',
					search: `?senha_atualizada=1`
				});
			}).catch(error => {
				const newState = {...this.state};
				newState.searching = false;
				newState.show_notification_error = true;
				this.setState(newState);
		});
	}

	updateInputValueSenha(event) {
		this.setState({
			senha: event.target.value,
			senha2: this.state.senha2
		});
	}

	updateInputValueSenha2(event) {

		let senha = this.state.senha;
		let senha2 = event.target.value;
		let invalid = senha2.length !== 0 && senha2 !== senha;

		this.setState({
			senha2: senha2,
			senha: senha,
			invalid: invalid,
			enable_button: !invalid && senha2.length > 0
		});
	}

	onDismiss() {
		const newState = {...this.state};
		newState.show_notification = false;
		this.setState(newState);
	}

	handleKeyPress(event) {
		if (event.key === 'Enter') {
			this.doLogin();
		}
	}

	render() {

		const {invalid} = this.state;

		let spinner = <div></div>;

		if (this.state.searching) {
			spinner = <div>
				<div className="spinner-results">
					<DotLoader
						color={'#3AAFB9'}
						loading={true}
					/>
				</div>
				<span className='spinner-label'>Atualizando sua senha...</span>
			</div>
		}

		return (
			<div className="app flex-row align-items-center login">
				<Alert isOpen={this.state.show_notification} color="success" fade={true}>
					Sua senha foi atualizada com sucesso!
				</Alert>
				<Alert isOpen={this.state.show_notification_error} color="danger" fade={true}>
					Sua solicitação expirou! Solicite novamente!
				</Alert>
				<Container>
					<Row className="justify-content-center">
						<Col md="8">
							<CardGroup>
								<Card className="p-4">
									<CardBody>
										<Form>
											<h1>Nova senha</h1>
											<p className="text-muted">Digite sua nova senha.</p>
											<InputGroup className="mb-4" onKeyPress={this.handleKeyPress}>
												<InputGroupAddon addonType="prepend">
													<InputGroupText>
														<i className="icon-lock"></i>
													</InputGroupText>
												</InputGroupAddon>
												<Input type="password" placeholder="Nova senha" value={this.state.senha} onChange={this.updateInputValueSenha}/>
											</InputGroup>
											<InputGroup className="mb-4" onKeyPress={this.handleKeyPress}>
												<InputGroupAddon addonType="prepend">
													<InputGroupText>
														<i className="icon-lock"></i>
													</InputGroupText>
												</InputGroupAddon>
												<Input invalid={invalid} type="password" placeholder="Repita sua senha" value={this.state.senha2} onChange={this.updateInputValueSenha2}/>
												<FormFeedback>As senhas não coincidem</FormFeedback>
											</InputGroup>
											<Row>
												<Col xs="4">
													<Button
														disabled={!this.state.enable_button}
														color="primary"
														className="px-4"
														onClick={this.changePassword}
													>Criar nova senha</Button>
												</Col>
												<Col xs="8" className="text-right">
													<Button color="link" className="px-0" href="/#/new-password-request">Solicitar novamente</Button>
												</Col>
											</Row>
											{spinner}
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

export default NewPassword;
