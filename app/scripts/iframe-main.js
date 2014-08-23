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

// Register reporters
// jasmineEnv.addReporter(new jasmine.TrivialReporter());              //< for html
jasmineEnv.addReporter(new jasmine.JSReporter2()); //< for jsreporter
jasmineEnv.updateInterval = 1000;

window.run = function() {
    jasmine.getEnv().execute();
    var report = jasmine.getJSReport();
    // window.parent.stuffEmit('log',report);
    kodrReporter(report);
};
