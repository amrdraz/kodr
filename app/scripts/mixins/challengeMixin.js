module.exports = Em.Mixin.create({
    jshint: function(code, cb, options) {
        options = options || {};
        var console = this.get('console') || console;
        console.Write  = console.Write || console.log;
        var sb = options.sandbox || this.get('csandbox') || window;
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
            "latedef": true,
            "newcap": false,
            "noarg": true,
            "undef": true,
            "strict": false,
            "trailing": false,
            "smarttabs": true,
        });
        var errors = JSHINT.errors;
        if (!errors.length) {
            cb && cb.call(this, code, console, sb);
        } else {
            this.testError(errors);
        }

        // debugger;
        return errors;
    },
    testError: function (errors) {
        var console = this.get('console') || console;
        console.Write  = console.Write || console.log;
       console.Write('Syntax Error line(' + errors[0].line + '): ' + errors[0].reason + '\n', 'error');
    },
    testSuccess: function(report) {
        var tests = report.tests.length;
        var passes = report.passes.length;
        var failures = report.failures.length;
        var pass = tests === passes;
        var console = this.get('console') || console;
        console.Write  = console.Write || console.log;
        var writeTest = function(test, pass) {
            console.Write(test.title + '\n', pass);
        };

        console.Write("========= Running Submission " + (pass ? 'Passed' : 'Failed') + " ==========\n", pass ? 'result' : 'error');

        if (passes) {
            report.passes.forEach(function(test) {
                writeTest(test, 'result');
            });
            failures && console.Write('\n-----------------------------------\n\n');
        }

        if (failures) {
            report.failures.forEach(function(test) {
                writeTest(test, 'error');
            });
        }
        console.Write("==============================================\n", pass ? 'result' : 'error');

        return tests === passes;
    },
    actions: {
        sandboxLoaded: function(sb) {
            var that = this;
            var log = function(msg) {
                console.log(msg);
                that.get('console').Write(msg.toString() + '\n');
            };

            sb.on('error', log);
            sb.on('test.done', this.testSuccess.bind(this));
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
