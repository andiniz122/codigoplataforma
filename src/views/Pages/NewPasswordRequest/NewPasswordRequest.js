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

import {DotLoader} from 'react-spinners';

import axios from 'axios';

class NewPasswordRequest extends Component {

	constructor(props) {
		super(props);

		this.state = {
			email: '',
			show_spinner: false,
			show_notification: false,
			show_notification_error: false,
			enable_button: false,
			searching: false
		};

		this.changePassword = this.changePassword.bind(this);
		this.updateInputValue = this.updateInputValue.bind(this);
		this.onDismiss = this.onDismiss.bind(this);
		this.handleKeyPress = this.handleKeyPress.bind(this);
	}

	changePassword(x) {

		const newState = {...this.state};
		newState.searching = true;
		this.setState(newState);

		const {email} = this.state;

		const url = `/new-password?email=${email}`;
		axios.post(url)
			.then(response => {
				const newState = {...this.state};
				newState.show_notification = true;
				newState.searching = false;
				this.setState(newState);

				setTimeout(function() {
					const newState = {...this.state};
					newState.show_notification = false;
					this.setState(newState);
				}.bind(this), 2000)
			}).catch(error => {
				const newState = {...this.state};
				newState.searching = false;
				newState.show_notification_error = true;
				this.setState(newState);
		});
	}

	updateInputValue(event) {
		let email = event.target.value;
		this.setState({
			email: email,
			enable_button: email.length > 0
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

		let spinner = <div></div>;

		if (this.state.searching) {
			spinner = <div>
				<div className="spinner-results">
					<DotLoader
						color={'#3AAFB9'}
						loading={true}
					/>
				</div>
				<span className='spinner-label'>Gerando solicitação...</span>
			</div>
		}

		return (
			<div className="app flex-row align-items-center login">
				<Alert isOpen={this.state.show_notification} color="success" fade={true}>
					Em breve você receberá um email para redefinir sua senha.
				</Alert>
				<Alert isOpen={this.state.show_notification_error} color="danger" fade={true}>
					Sua solicitação não pôde ser completada! Verifique se o email está correto.
				</Alert>
				<Container>
					<Row className="justify-content-center">
						<Col md="8">
							<CardGroup>
								<Card className="p-4">
									<CardBody>
										<Form>
											<h1>Esqueci minha senha</h1>
											<p className="text-muted">Digite seu email de cadastro.</p>
											<InputGroup className="mb-4" onKeyPress={this.handleKeyPress}>
												<InputGroupAddon addonType="prepend">
													<InputGroupText>
														<i className="icon-user"></i>
													</InputGroupText>
												</InputGroupAddon>
												<Input type="email" placeholder="fulano@provedor.com.br" value={this.state.email} onChange={this.updateInputValue}/>
											</InputGroup>
											<Row>
												<Col xs="4">
													<Button
														disabled={!this.state.enable_button}
														color="primary"
														className="px-6"
														onClick={this.changePassword}
													>Solicitar nova senha</Button>
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

export default NewPasswordRequest;
