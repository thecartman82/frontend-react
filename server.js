'use strict';

var path = require('path');

var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var cors = require('cors');

app.set('view engine', 'ejs');

app.use('/static', express.static(path.resolve(__dirname, './static')));
app.use('/solution', express.static(path.resolve(__dirname, './solution/build')));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
 
var routes = require("./routes.js")(app);
 
var server = app.listen(3002, function () {
  console.log("Listening on port %s", server.address().port);
});