var config = require('./config');
var path = require('path');
var express = require('express');
var mysql = require('mysql'); // node-mysql module
var myConnection = require('express-mysql-connection');// express-mysql-connection middleware module
var useDynamicRouter=['/api','/auth'];

// default port where dev server listens for incoming traffic
var port = config.port;
var apiRouter = require('./routers/api');

var app = express()

app.use(useDynamicRouter, myConnection(mysql, config.db.mysql, 'pool') );

app.use('/api',apiRouter);



module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err)
    return
  }
})
