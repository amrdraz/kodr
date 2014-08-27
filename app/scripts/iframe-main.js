window.onerror = function(error) {
    window.parent.stuffEmit("error", error);
};
var stuctured = require('structured');
var sandbox = require('./sandbox/iframe-sandbox');
var utils = require('./sandbox/iframe-utils');
var kodrReporter = utils.KodrReporter;
var rethrow = window.rethrow = utils.rethrow;
var jasmine = window.jasmine = require('../vendor/jasmine/boot-jasmine');
require('../vendor/jasmine/jasmine-jsreporter.js');

var jasmineEnv = jasmine.getEnv();

jasmineEnv.updateInterval = 1000;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 1500;
// Register reporters
// jasmineEnv.addReporter(new jasmine.TrivialReporter());              //< for html
jasmineEnv.addReporter(new jasmine.JSReporter2(function (report) {
    kodrReporter(report);
})); //< for jsreporter

window.run = function() {
    jasmine.getEnv().execute();
    if(!jasmine.getJSReport()) {
        window.parent.stuffEmit('waiting');
        window.parent.stuffEmit('log', 'waiting...');
    }
};
