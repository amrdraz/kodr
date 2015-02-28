var Promise = require('bluebird');
var _ = require('lodash');
var observer = require('../observer');

module.exports = exports = function lastModifiedPlugin(schema, options) {
    var Model  = options.model || options;
    schema.plugin(require('./_common_helper'), options);
};
