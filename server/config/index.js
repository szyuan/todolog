'use strict';

var env = process.env.NODE_ENV || 'development';
var config = null;

if(env === "production") {
    config = require('./prod/prod.js');
}else {
    config = require('./dev.js');
}

config.env = env;

module.exports = config;