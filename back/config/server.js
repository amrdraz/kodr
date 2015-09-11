var _ = require('lodash');
var config = {
    runJava:false,
};

switch(process.env.NODE_ENV) {
case 'production':case 'prod':
    config = _.assign(config, require('./prod'));
    break;
case 'dev':case 'development':
    config = _.assign(config, require('./dev'));
    break;
default:
    config = _.assign(config, require('./tests'));
}

module.exports = config;