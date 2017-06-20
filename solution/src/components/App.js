import React, {Component} from 'react';

import api from '../lib/api';

import {fillData} from '../lib/utils';

import Header from './Header';
import NumberInput from './NumberInput';
import DataTable from './DataTable';
import Loader from './Loader';

import './App.css';

class App extends Component {
	constructor(props) {
		super(props);
		
		this.state = {
			from: 1,
			to: 20,
			token: null,
			data: null,
			loading: false,
			error: null
		};
		
		this.loadData = this.loadData.bind(this);
	}
	
	componentWillMount() {
		this._mounted = true;
		this.loadData();
	}
	
	componentWillUnmount() {
		this._mounted = false;
	}
	
	loadData() {
		const that = this;
		
		if (this.state.loading) {
			return false;
		}
		
		this.setState({
			loading: true
		});
		
		const {from, to} = this.state;
		
		if (this.state.token) {
			doLoadData(this.state.token);
		} else {
			doGetToken();
		}
		
		return;
		
		function doGetToken() {
			return api.getToken()
				.then(
					response => {
						if (!that._mounted) {
							return;
						}
						
						that.setState({
							token: response.token
						});
						
						return doLoadData(response.token);
					},
					err => {
						if (!that._mounted) {
							return;
						}
						
						that.setState({
							loading: false,
							data: null,
							error: err,
							token: null
						});
					}
				);
		}
		
		function doLoadData(token) {
			return api.getData(from, to, token)
				.then(
					response => {
						if (!that._mounted) {
							return;
						}
						
						that.setState({
							loading: false,
							token: response.token,
							data: fillData(response.data, from, to),
							error: null
						});
					},
					err => {
						if (!that._mounted) {
							return;
						}
						
						if (err.code === 401) {
							// We might be able to get token
							return doGetToken();
						}
						
						const nextState = {
							loading: false,
							data: null,
							error: err
						};
						
						if (err.code >= 500 || err.code === 403) {
							nextState.token = null;
						}
						
						that.setState(nextState);
					}
				);
		}
	}
	
	renderError() {
		if (this.state.error) {
			return (
				<div className="alert alert-danger">
					<h4>Error code {this.state.error.code}</h4>
					<p>{this.state.error.message}</p>
				</div>
			);
		}
	}
	
	renderData() {
		if (this.state.loading) {
			return (
				<div className="App-loader">
					<Loader />
				</div>
			);
		}
		
		if (!this.state.data) {
			return null;
		}
		
		return <DataTable data={this.state.data} />;
	}
	
	render() {
		return (
			<div className="App">
				<Header />
				
				<div className="container">
					<div className="App-controls">
						<form className="form-inline">
							<NumberInput label="From" value={this.state.from} onChange={from => this.setState({from})} />
							<NumberInput label="To" value={this.state.to} onChange={to => this.setState({to})} />
							<button className="btn btn-success" disabled={this.state.loading} onClick={this.loadData}>
								Load
							</button>
						</form>
					</div>
					
					<div className="App-error">
						{this.renderError()}
					</div>
					
					<div className="App-data">
						{this.renderData()}
					</div>
				</div>
			</div>
		);
	}
}

export default App;
