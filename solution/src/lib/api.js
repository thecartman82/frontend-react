import ENV from '../env';

export class Api {
	constructor(endpoint) {
		this.endpoint = endpoint;
	}
	
	_get(path) {
		let response = null;
		return fetch(this.endpoint + path)
			.then(res => {
				response = res;
				return res.json();
			})
			.then(result => {
				if (result.error) {
					const error = new Error(result.error.message);
					error.code = response.status;
					throw error;
				}
				
				return result;
			});
	}
	
	getToken() {
		return this._get('/token');
	}
	
	getData(from, to, token) {
		return this._get(`/data?from=${from}&to=${to}&token=${token}`);
	}
}

const api = new Api(ENV.api_endpoint);

export default api;