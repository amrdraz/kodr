var config = {};

switch(process.env.NODE_ENV) {
case 'production':case 'prod':
    config = require('./prod');
    break;
case 'dev':case 'development':
    config = require('./dev');
    break;
default:
    config = require('./tests');
}

module.exports = config;