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
    jshint: function(code) {
        JSHINT(code, {
            "asi":true, // supress simicolon warning
            "boss": true, // supress warning about using assignment inside while condition
            "eqnull":true,
            "expr": true, // you can type random expressions
            "esnext": false,
            "bitwise": true,
            "curly": false,
            "eqeqeq": true,
            "eqnull": true,
            "immed": false,
            "latedef": false,
            "newcap": false,
            "noarg": true,
            "undef": false,
            "strict": false,
            "trailing": false,
            "smarttabs": true,
        });
        // debugger;
        return JSHINT.errors;
    },
    actions: {
        run: function() {
            this.get('controllers.challenge').send('run');
        },
        runInConsole: function() {
            this.send('consoleEval', this.get('model.code'));
        },
        consoleEval: function(command) {
            var console = this.get('console');
            var sb = this.get('csandbox');
            var errors = this.jshint(command);
            if (!errors.length) {
                sb.evaljs(command, function(error, res) {
                    if (error) {
                        console.Write(error.name + ': ' + error.message + '\n', 'error');
                    } else {
                        console.Write('==> ' + (res !== undefined ? res : "") + '\n', 'result');
                    }
                });
            } else {
                console.Write('Syntax Error line('+errors[0].line+'): ' + errors[0].reason + '\n', 'error');
            }

        }
    }
});
