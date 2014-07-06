var debounce = require('../utils/debounce');

module.exports = Em.ObjectController.extend({
    // needs: [],
    actions: {
        run: debounce(function() {
            var model = this.get('model');

            var iframeTemplate = require('../demo/iframe');
            var stuff = require('../vendor/stuff');
            var Runner = require('../runners/runner');

            var iframe;

            stuff(window.location.origin + '/iframe.html', $('#sandbox')[0], function(context) {
                iframe = context;

                iframe.load(iframeTemplate, function () {
                   var code;
                    if (model.get('structure')) {
                        code = Runner.structure(model.get('setup'), model.get('structure'), model.get('callbacks'));
                        iframe.evaljs(code);
                    }
                    if (model.get('setup')) {
                        code = Runner.test(model.get('setup'), model.get('tests'));
                        iframe.evaljs(code);
                    }
                });

                iframe.on('error', function(obj) {
                    console.log(obj);
                });


                iframe.on('test.done', function(msg) {
                    console.log(msg);
                });

                iframe.on('structure.done', function(msg) {
                    console.log(msg);
                });

                iframe.on('log', function(msg) {
                    console.log(msg);
                });
            });
        })
    }
});
