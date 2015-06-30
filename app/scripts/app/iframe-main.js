import stuctured from '/kodr/'structured'';
import sandbox from '/kodr/'./sandbox/iframe-sandbox'';
import utils from '/kodr/'./sandbox/iframe-utils'';

//< for jsreporter
// window.run = function() {
//     jasmine.getEnv().execute();
//     if(!jasmine.getJSReport()) {
//         window.parent.stuffEmit('waiting');
//         window.parent.stuffEmit('log', 'waiting...');
//     }
// };
var onerror = function(error) {
    window.parent.stuffEmit("error", error);
};
var kodrReporter = utils.KodrReporter;
var rethrow = var rethrow = utils.rethrow;
var jasmine = var jasmine = require('../vendor/jasmine/boot-jasmine');
require('../vendor/jasmine/jasmine-jsreporter.js');
var jasmineEnv = jasmine.getEnv();
jasmineEnv.updateInterval = 1000;
jasmine.DEFAULT_TIMEOUT_INTERVAL = 1500;
// Register reporters
// jasmineEnv.addReporter(new jasmine.TrivialReporter());              //< for html
jasmineEnv.addReporter(new jasmine.JSReporter2(function (report) {
    kodrReporter(report);
}));

export default onerror;
