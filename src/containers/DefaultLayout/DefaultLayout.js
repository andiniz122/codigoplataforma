import React, {Component, Suspense} from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import {Container} from 'reactstrap';

import {
	AppAside,
	AppBreadcrumb,
	AppFooter,
	AppHeader,
	AppSidebar,
	AppSidebarFooter,
	AppSidebarForm,
	AppSidebarHeader,
	AppSidebarMinimizer,
	AppSidebarNav,
} from '@coreui/react';
// sidebar nav config
import navigation from '../../_nav';
// routes config
import routes from '../../routes';
import _ from "lodash";

const DefaultAside = React.lazy(() => import('./DefaultAside'));
const DefaultFooter = React.lazy(() => import('./DefaultFooter'));
const DefaultHeader = React.lazy(() => import('./DefaultHeader'));



class DefaultLayout extends Component {

	loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>;

	signOut(e) {
		e.preventDefault();
		this.props.history.push('/login');
	}

	componentWillMount() {

		let loginData = JSON.parse(localStorage.getItem('login-data'));

		navigation.items = navigation.items.slice(0, 3);

		if(loginData !== null && loginData.is_admin) {

			navigation.items.push({
				name: 'Demanda',
				url: '/demanda-admin',
				icon: 'fas fa-chart-pie',
				badge: {
					variant: 'warning',
					text: 'admin',
				},
			});

			navigation.items.push({
				name: 'Organizações',
				url: '/organizacao',
				icon: 'fas fa-sitemap',
				badge: {
					variant: 'warning',
					text: 'admin',
				},
			});

			navigation.items.push({
				name: 'Monitoramento',
				url: '/monitoramento',
				icon: 'fas fa-desktop',
				badge: {
					variant: 'warning',
					text: 'admin',
				},
			});
		} else if(loginData !== null && loginData.is_supervisor) {
			navigation.items.push({
				name: 'Usuários',
				url: '/organizacao/usuarios-adm',
				icon: 'fas fa-users',
				badge: {
					variant: 'warning',
					text: 'admin',
				},
			});

			navigation.items.push({
				name: 'Unidade',
				url: '/organizacao/unidades',
				icon: 'fas fa-building',
				badge: {
					variant: 'warning',
					text: 'admin',
				},
			});

			navigation.items.push({
				name: 'Demanda',
				url: '/demanda',
				icon: 'fas fa-chart-pie',
				badge: {
					variant: 'warning',
					text: 'admin',
				},
			});

		}

	}

	render() {
		return (
			<div className="app">
				<AppHeader fixed>
					<Suspense fallback={this.loading()}>
						<DefaultHeader onLogout={e => this.signOut(e)}/>
					</Suspense>
				</AppHeader>
				<div className="app-body">
					<AppSidebar fixed display="lg">
						<AppSidebarHeader/>
						<AppSidebarForm/>
						<Suspense>
							<AppSidebarNav navConfig={navigation} {...this.props} />
						</Suspense>
						<AppSidebarFooter/>
						<AppSidebarMinimizer/>
					</AppSidebar>
					<main className="main">
						<AppBreadcrumb appRoutes={routes}/>
						<Container fluid>
							<Suspense fallback={this.loading()}>
								<Switch>
									{routes.map((route, idx) => {
										return route.component ? (
											<Route
												key={idx}
												path={route.path}
												exact={route.exact}
												name={route.name}
												render={props => (
													<route.component {...props} />
												)}/>
										) : (null);
									})}
									<Redirect from="/" to="/login"/>
								</Switch>
							</Suspense>
						</Container>
					</main>
					<AppAside fixed>
						<Suspense fallback={this.loading()}>
							<DefaultAside/>
						</Suspense>
					</AppAside>
				</div>
				<AppFooter>
					<Suspense fallback={this.loading()}>
						<DefaultFooter/>
					</Suspense>
				</AppFooter>
			</div>
		);
	}
}

export default DefaultLayout;
