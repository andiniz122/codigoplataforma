import React from 'react';

const Home = React.lazy(() => import('./views/Home'));
const Consumo = React.lazy(() => import('./views/Consumo'));
const DashboardDemanda = React.lazy(() => import('./views/DashboardDemanda'));
const DashboardDemandaSuperAdmin = React.lazy(() => import('./views/DashboardDemandaSuperAdmin'));
const ListaTarifasEnergia = React.lazy(() => import('./views/ListaTarifasEnergia'));
const ListaTarifasAgua = React.lazy(() => import('./views/ListaTarifasAgua'));
const Unidade = React.lazy(() => import('./views/Unidade'));
const Organizacao = React.lazy(() => import('./views/Organizacao'));
const Usuarios = React.lazy(() => import('./views/Usuarios'));
const UsuariosAdmin = React.lazy(() => import('./views/UsuariosAdmin'));
const Monitoramento = React.lazy(() => import('./views/Monitoramento'));
const Faturas = React.lazy(() => import('./views/Faturas/Faturas'));


const routes = [
	{ path: '/home', name: 'Home', component: Home },
	{ path: '/consumo', name: 'Consumo', component: Consumo },
	{ path: '/demanda', name: 'Demanda', component: DashboardDemanda },
	{ path: '/demanda-admin', name: 'Demanda', component: DashboardDemandaSuperAdmin },
	{ path: '/organizacao/tarifas', name: 'Tarifas', component: ListaTarifasEnergia },
	{ path: '/organizacao/tarifas-agua', name: 'Tarifas', component: ListaTarifasAgua },
	{ path: '/organizacao/unidades', name: 'Unidades', component: Unidade },
	{ path: '/organizacao/usuarios', name: 'Usuários', component: Usuarios },
	{ path: '/organizacao/usuarios-adm', name: 'Usuários', component: UsuariosAdmin },
	{ path: '/organizacao', name: 'Organizações', component: Organizacao },
	{ path: '/monitoramento', name: 'Monitoramento', component: Monitoramento },
	{ path: '/faturas', name: 'Faturas', component: Faturas },
];

export default routes;
