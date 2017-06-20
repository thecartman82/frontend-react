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

const EASE_OFF_DURATION = 1000 * 30;
const BAN_DURATION = 1000 * 30;
let IP_DATA = {};

var routes = function(app) {
  
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
  
  app.get('/solution', (req, res, next) => {
    res.render('solution.ejs');
  });
   
  app.get('/data', (req, res, next) => {
    // Instability
    if (Math.random() * 100 < 5) {
      IP_DATA = {};
      return next(new Error('Internal server error'));
    }
    
    // IP banning
    const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(',')[0];
    const ipRecord = IP_DATA[ip];
    if (ipRecord) {
      if (ipRecord.bannedAt && new Date() - ipRecord.bannedAt < BAN_DURATION) {
        return next(`You had been banned at ${ipRecord.bannedAt}. Ban duration is ${BAN_DURATION / 1000} seconds. Try later.`);
      }
      
      if (ipRecord.token && ipRecord.token !== req.query['token']) {
        if (new Date() - ipRecord.lastRequestAt < EASE_OFF_DURATION) {
          // Ban ip
          IP_DATA[ip] = {
            bannedAt: new Date()
          };
          return next(`You have been banned for ${BAN_DURATION / 1000} seconds`);
        }
      }
    }
       
    // Query validation
    const from = Number(req.query['from']) || 1;
    const to = Number(req.query['to']) || 1000;
    
    if (!(from >= 1 && from <= 1000)) {
      return next(`Invalid "from": ${req.query['from']}`);
    }
    
    if (!(to >= 1 && to <= 1000)) {
      return next(`Invalid "to": ${req.query['to']}`);
    }
    
    if (to < from) {
      return next(`"from" must not be larger than "to"`);
    }
    
    // Token generation 
    const token = Math.random().toString().slice(2);
    IP_DATA[ip] = {
      token,
      lastRequestAt: new Date()
    };
    
    // Results
    const results = [];
    for (let i = from - 1; i <= to - 1; i++) {
      const record = data[i];
      if (record.slot !== null || record.city !== null || record.velocity !== null) {
        results.push(record);
      }
    }
    
    return res.send({
      data: results,
      token
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