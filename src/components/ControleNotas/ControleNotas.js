import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap';
import axios from "axios";

class ControleNotas extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			show_notification: false,
			qt_notas_total: 0,
			qt_notas_usadas: 0
		};

	}

	componentDidMount() {
		const newState = {...this.state};

		const url = `/nota`;

		// axios.get(url)
		// 	.then(response => {
		//
		// 		console.log(response.data);
		//
		// 		if (response.data.plano === 1) {
		// 			newState.qt_notas_total = response.data.qt_total;
		// 			newState.qt_notas_usadas = response.data.qt_notas_geradas;
		// 			newState.show_notification = true;
		// 		}
		//
		// 		this.setState(newState);
		// 	}).catch(error => {
		// 		// if(typeof error.response !== 'undefined') {
		// 		// 	if (error.response.status === 401) {
		// 		// 		localStorage.removeItem('login-data');
		// 		// 		window.location = '/#/login'
		// 		// 	}
		// 		// }
		// });
	}

	render() {

		return (
			<div className='controle-notas'>
				<Alert color='primary' isOpen={this.state.show_notification}>
					Você gerou <strong>{this.state.qt_notas_usadas}</strong> de <strong>{this.state.qt_notas_total}</strong> notas no plano Gratuito!
					<Button color="success">Conheça nossos planos</Button>
				</Alert>
			</div>
		);
	}
}

export default ControleNotas;
