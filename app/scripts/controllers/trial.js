var debounce = require('../utils/debounce');
var ChallengeMixin = require('../mixins/challengeMixin');
module.exports = App.ChallengeTryController = Em.ObjectController.extend(ChallengeMixin, {
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

        })
    }
});
