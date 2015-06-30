// var expect = chai.expect;
// var assert = chai.assert;
// mocha.setup({
//     ui: 'bdd',
//     reporter: JSONReporter,
//     // reporter: 'html',
//     ignoreLeaks: true
// });
function generateStackstrace(error, code) {
    var lines = code.split("\n");
    return [
        "" + error.name + ": " + error.message,
        "  at line " + error.lineNumber + 1 + ":" + error.columnNumber,
        "",
        "" + [error.lineNumber - 1] + " : " + lines[error.lineNumber - 2],
        "" + [error.lineNumber] + " : " + lines[error.lineNumber - 1],
        "" + [error.lineNumber + 1] + ">: " + lines[error.lineNumber],
        "" + [error.lineNumber + 2] + " : " + lines[error.lineNumber + 1],
        "" + [error.lineNumber + 3] + " : " + lines[error.lineNumber + 2]
    ].join("\n");
}
function rethrow(e, tests, offset) {
    var error = e;
    try {
        if (window[e.name]) {
            error = new window[e.name](e.message);
            error.type = e.type;
            error["arguments"] = e["arguments"];

            // Firefox
            if (e.lineNumber) {
                error.lineNumber = e.lineNumber - offset;
            }
            if (e.columnNumber) {
                error.columnNumber = e.columnNumber;
            }

            // Others
            if (!e.lineNumber || !e.lineNumber) {
                var errorPosition = e.stack.split("\n")[1].match(/(\d+):(\d+)\)$/);
                error.lineNumber = errorPosition[1] - offset;
                error.columnNumber = +errorPosition[2];
            }

            if (error.lineNumber) {
                error.stack = generateStackstrace(error, tests);
            }
        }
    } catch (error) {
        error = e;
    } finally {
        window.parent.stuffEmit("error", error);
    }
}
// Deep clone that only grabs strings and numbers

function cleanObject(error, depth) {
    if (!error || depth > 5) {
        return null;
    }

    depth = depth || 0;

    var response = {};
    for (var key in error) {
        try {
            if (key[0] === "_" || key[0] === "$" || key === 'ctx' || key === 'parent') {
                // Skip underscored variables
            } else if (typeof(error[key]) === 'string' || typeof(error[key]) === 'number') {
                response[key] = error[key];
            } else if (typeof(error[key]) === 'object') {
                response[key] = cleanObject(error[key], depth + 1);
            }
        } catch (e) {
            response[key] = 'Unable to process this result.';
        }
    }

    return response;
}
// function JSONReporter(runner) {
//     var self = this;
//     // Mocha.reporters.Base.call(this, runner);


//     /**
//      * Return a plain-object representation of `test`
//      * free of cyclic properties etc.
//      *
//      * @param {Object} test
//      * @return {Object}
//      * @api private
//      */

//     function clean(test) {
//         return {
//             title: test.title,
//             fullTitle: test.fullTitle(),
//             duration: test.duration
//             //, dirty:test
//         };
//     }

//     var tests = [],
//         failures = [],
//         passes = [];

//     runner.on('test end', function(test) {
//         tests.push(test);
//     });

//     runner.on('pass', function(test) {
//         passes.push(test);
//     });

//     runner.on('fail', function(test) {
//         failures.push(test);
//     });

//     runner.on('end', function() {
//         var obj = {
//             stats: self.stats,
//             tests: tests.map(clean),
//             failures: failures.map(clean),
//             passes: passes.map(clean)
//         };
//         window.parent.stuffEmit('test.done', obj);
//         // process.stdout.write(JSON.stringify(obj, null, 2));
//     });
// }
// 
function inspect (report) {
    report.suites.forEach(function (suite) {
        suite.specs.forEach(function (spec) {
            report.tests.push(spec);
            if(spec.passed) {
                report.passes.push(spec);
            } else {
                report.failures.push(spec);
            }
        });
    });
    report.passed = !report.failures.length;
}
function kodrReporter(report) {

    report.tests = [];
    report.failures = [];
    report.passes = [];

    inspect(report);

    window.parent.stuffEmit('test.done', report);
}
exports.rethrow = rethrow;
exports.KodrReporter = kodrReporter;

export default undefined;
