'use strict';

const marked = require('marked');
const fs = require('fs');
const libPath = require('path');

marked.setOptions({
	gfm: true,
	tables: true,
	breaks: false,
	pedantic: false,
	sanitize: false,
	smartLists: true,
	smartypants: true
});

const data = JSON.parse(fs.readFileSync(libPath.resolve(__dirname, 'data.json'), 'utf8'));

const BAN_DURATION = 1000 * 30;
const GET_TOKEN_DURATION = 1000 * 5;
let IP_DATA = {};

function instability(next) {
	if (Math.random() * 100 < 5) {
		IP_DATA = {};
		next(new Error('Internal server error'));
		return true;
	}
	return false;
}

function bounceIfBanned(ip, next) {
	const ipRecord = IP_DATA[ip];
	if (ipRecord && ipRecord.bannedAt && new Date() - ipRecord.bannedAt < BAN_DURATION) {
		next({
			message: `You had been banned at ${ipRecord.bannedAt}. Ban duration is ${BAN_DURATION / 1000} seconds. Try later.`,
			status: 403
		});
		return true;
	}
	
	return false;
}

function getIP(req) {
	return (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(',')[0];
}

function generateToken(ip) {
	const token = Math.random().toString().slice(2);
	IP_DATA[ip] = {
		token,
		lastRequestAt: new Date()
	};
	return IP_DATA[ip];
}

const routes = function (app) {
	
	app.get('/', (req, res, next) => {
		fs.readFile(libPath.resolve(__dirname, 'README.md'), 'utf8', (err, txt) => {
			if (err) {
				return next(err);
			}
			
			const readme = marked(txt);
			
			return res.render('index.ejs', {
				readme
			});
		});
	});
	
	app.get('/api/token', (req, res, next) => {
		if (instability(next)) {
			return;
		}
		
		const ip = getIP(req);
		
		if (bounceIfBanned(ip, next)) {
			return;
		}
		
		const {token} = generateToken(ip);
		
		setTimeout(() => {
			return res.send({
				token
			});
		}, GET_TOKEN_DURATION);
	});
	
	app.get('/api/data', (req, res, next) => {
		if (instability(next)) {
			return;
		}
		
		const ip = getIP(req);
		
		if (bounceIfBanned(ip, next)) {
			return;
		}
		
		// Query validation
		const token = req.query['token'];
		const from = Number(req.query['from'] ? req.query['from'] : 1);
		const to = Number(req.query['to'] ? req.query['to'] : 20);
		
		if (!token) {
			return next(`Missing required query parameter: "token"`);
		}
		
		if (!(from >= 1 && from <= 1000)) {
			return next(`Invalid "from": ${req.query['from']}`);
		}
		
		if (!(to >= 1 && to <= 1000)) {
			return next(`Invalid "to": ${req.query['to']}`);
		}
		
		if (to < from) {
			return next(`"from" must not be larger than "to"`);
		}
		
		const ipRecord = IP_DATA[ip];
		if (!ipRecord) {
			return next({
				message: `No active session found. Please use /token endpoint first.`,
				status: 401
			});
		}
		
		if (ipRecord.token !== token) {
			// Ban ip
			IP_DATA[ip] = {
				bannedAt: new Date()
			};
			return next({
				message: `Invalid token. You have been banned for ${BAN_DURATION / 1000} seconds`,
				status: 403
			});
		}
		
		generateToken(ip);
		
		const resultData = data.slice(from - 1, to - from);
		
		return res.send({
			data: resultData,
			token: IP_DATA[ip].token
		});
	});
	
	app.use((err, req, res, next) => {
		const errMessage = err.message || err;
		const status = err.status || (err.message ? 500 : 400);
		
		res.status(status).send({
			error: {
				message: errMessage
			}
		});
	});
};

module.exports = routes;