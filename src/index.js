import 'react-app-polyfill/ie9'; // For IE 9-11 support
import 'react-app-polyfill/ie11'; // For IE 11 support
import './polyfill'
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000';
// axios.defaults.baseURL = 'https://api.eletricom.me'; //

axios.interceptors.request.use(function (config) {
	let loginData = JSON.parse(localStorage.getItem('login-data'));
	let token = '';

	if (loginData != null) {
		token = loginData.token;
		config.headers.common.Authorization = `Bearer ${token}`;
		config.headers.common.UserId = loginData.login;
	}

	return config;
});

export function getJsonFromUrl(url) {
	var query = url.substr(1);
	var result = {};
	query.split("&").forEach(function(part) {
		var item = part.split("=");
		result[item[0]] = decodeURIComponent(item[1]);
	});
	return result;
}

ReactDOM.render(<App />, document.getElementById('root'));

serviceWorker.unregister();
