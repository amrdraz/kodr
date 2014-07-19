var debounce = require('../utils/debounce');

module.exports = App.ChallengeTryController = Em.ObjectController.extend({
    needs: ['challenge'],
    //
    init: function() {
        this._super();
        // this.addObserver('hasSandbox', this, function () {
        //     this.removeObserver('hasSandbox', this);
        //     var sb = this.get('sandbox');
        //     var console = this.get('console');
        //     var handler = function(msg) {
        //         console.Write('==> ' + msg + '\n');
        //     };

        //     sb.on('error', handler);
        //     sb.on('test.done', handler);
        //     sb.on('structure.done', handler);
        //     sb.on('log', handler);
        // });
    },
    results: "Run Code to see output",

    jshint: function(code, cb, options) {
        options = options || {};
        var console = this.get('console');
        var sb = options.sandbox || this.get('csandbox');
        JSHINT(code, {
            "asi": true, // supress simicolon warning
            "boss": true, // supress warning about using assignment inside while condition
            "eqnull": true,
            "expr": true, // you can type random expressions
            "esnext": false,
            "bitwise": true,
            "curly": false,
            "eqeqeq": true,
            "eqnull": true,
            "immed": false,
            "latedef": options.run || false,
            "newcap": false,
            "noarg": true,
            "undef": options.run || false,
            "strict": false,
            "trailing": false,
            "smarttabs": true,
        });
        var errors = JSHINT.errors;
        if (cb) {
            if (!errors.length) {
                cb.call(this, code, console, sb);
            } else {
                console.Write('Syntax Error line(' + errors[0].line + '): ' + errors[0].reason + '\n', 'error');
            }

        }
        // debugger;
        return errors;
    },
    actions: {
        run: debounce(function() {
            var model = this.get('model');
            var challenge = this.get('model.challenge');
            var controller = this;
            var sb = controller.get('sandbox');
            var Runner = require('../runners/runner');
            var iframeTemplate = require('../demo/iframe');
            controller.jshint(model.get('code'), function(code, console, sb) {
                sb.load(iframeTemplate, function() {
                    sb.evaljs(Runner.test(code, challenge.get('tests')));
                });
            }, {
                sandbox: sb,
                run: true
            });

        }),
        sandboxLoaded: function(sb) {
            var that = this;
            var log = function(msg) {
                console.log(msg);
                that.get('console').Write(msg.toString() + '\n');
            };
            var writeTest = function(test, pass) {
                that.get('console').Write(test.title + '\n', pass);
            };
            sb.on('error', log);
            sb.on('test.done', function(report) {
                var tests = report.tests.length;
                var passes = report.passes.length;
                var failures = report.failures.length;
                var pass = tests === passes;
                that.get('console').Write("========= Running Submittion " + (pass ? 'Passed' : 'Failed') + " ==========\n", pass ? 'result' : 'error');

                if (passes) {
                    report.passes.forEach(function(test) {
                        writeTest(test, 'result');
                    });
                    failures && that.get('console').Write('\n-----------------------------------\n\n');
                }

                if (failures) {
                    report.failures.forEach(function(test) {
                        writeTest(test, 'error');
                    });
                }
                that.get('console').Write("==============================================\n", pass ? 'result' : 'error');

                if (tests === passes) {
                    that.set('passed', true);
                }
            });
            // sb.on('structure.done', log);
            sb.on('log', log);
            console.log('loaded sandbox');
        },
        runInConsole: function() {
            this.send('consoleEval', this.get('model.code'));
        },
        consoleEval: function(command) {
            this.jshint(command, function(code, console, sb) {
                sb.evaljs(command, function(error, res) {
                    if (error) {
                        console.Write(error.name + ': ' + error.message + '\n', 'error');
                    } else {
                        console.Write('==> ' + (res !== undefined ? res : "") + '\n', 'result');
                    }
                });
            });
        }
    }
});
