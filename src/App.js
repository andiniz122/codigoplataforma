import React, {Component} from 'react';
import {HashRouter, Route, Switch} from 'react-router-dom';
// import { renderRoutes } from 'react-router-config';
import './App.scss';

const loading = () => <div className="animated fadeIn pt-3 text-center">Loading...</div>;

// Containers
const DefaultLayout = React.lazy(() => import('./containers/DefaultLayout'));

// Pages
const Login = React.lazy(() => import('./views/Pages/Login'));
const NewPassword = React.lazy(() => import('./views/Pages/NewPassword'));
const NewPasswordRequest = React.lazy(() => import('./views/Pages/NewPasswordRequest'));
const Register = React.lazy(() => import('./views/Pages/Register'));
const Page404 = React.lazy(() => import('./views/Pages/Page404'));
const Page500 = React.lazy(() => import('./views/Pages/Page500'));

class App extends Component {

	constructor(props) {
		super(props);

		let loginData = JSON.parse(localStorage.getItem('login-data'));

		if(loginData == null) {
			loginData = {
				ok: false,
				name: ''
			}
		}

		this.state = {
			loggedIn: loginData.ok,
			userName: loginData.name
		};

		this.updateLoggedState = this.updateLoggedState.bind(this);
	}

	updateLoggedState(prop, history) {

		let loggedIn = prop.data.ok;

		this.setState({
			loggedIn: loggedIn
		});

		if (loggedIn) {
			history.push('/home');
		}
	}

	render() {
		return (
			<HashRouter>
				<React.Suspense fallback={loading()}>
					<Switch>
						<Route exact path="/login" name="Login Page"
							   render={props => <Login history={props.history} updateLoggedState={this.updateLoggedState}/>}
						/>
						<Route exact path="/register" name="Register Page" render={props => <Register {...props}/>}/>
						<Route exact path="/new-password" name="Nova senha" render={props => <NewPassword {...props}/>}/>
						<Route exact path="/new-password-request" name="Nova senha" render={props => <NewPasswordRequest {...props}/>}/>
						<Route exact path="/404" name="Page 404" render={props => <Page404 {...props}/>}/>
						<Route exact path="/500" name="Page 500" render={props => <Page500 {...props}/>}/>
						<Route path="/" name="Home" render={props => <DefaultLayout {...props}/>}/>
					</Switch>
				</React.Suspense>
			</HashRouter>
		);
	}
}

export default App;
