var debounce = require('../../utils/debounce');

module.exports = Em.ObjectController.extend({
    needs: ['challenge'],
    actions: {
        run: debounce(function() {
            var model = this.get('model');
            var controller = this;
            var sb = controller.get('sandbox');
            var Runner = require('../../runners/runner');
            var iframeTemplate = require('../../demo/iframe');
            sb.load(iframeTemplate, function() {
                var code;
                if (model.get('structure')) {
                    code = Runner.structure(model.get('solution'), model.get('structure'), model.get('callbacks'));
                    sb.evaljs(code);
                }
                if (model.get('tests')) {
                    code = Runner.test(model.get('solution'), model.get('tests'));
                    sb.evaljs(code);
                }
            });
        }),
        sandboxLoaded: function(sb) {
            var log = function(msg) {
                console.log(msg);
            };
            sb.on('error', log);
            sb.on('test.done', log);
            sb.on('structure.done', log);
            sb.on('log', log);
            console.log("sandbox loaded");
        },
        consoleEval: function(argument) {
            // body...
        },
        validate: function() {
            this.send('run');
        },
        reset: function() {
            this.get('model').rollback();
        },
        save: function() {
            var that = this;
            this.get('model').save().then(function(ch) {
                if (App.get('currentPath').contains('create'))
                    that.transitionToRoute('challenge.edit', ch.get('id'));
            }).catch(function(xhr) {
                that.set('errorMessage', xhr.responseText);
            });
        },
        delete: function() {
            this.get('model').destroyRecord();
            this.transitionToRoute('challenges');
        },
        publish: function() {
            this.set('model.isPublished', true);
            this.get('model').save().then(function(ch) {
                console.log('published');
            });
        },
        unPublish: function() {
            this.set('model.isPublished', false);
            this.get('model').save().then(function(ch) {
                console.log('unPublished');
            });
        }

    }
});
