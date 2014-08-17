var debounce = require('../../utils/debounce');
var ChallengeMixin = require('../../mixins/challengeMixin');
module.exports = Em.ObjectController.extend(ChallengeMixin, {
    needs: ['challenge', 'arena'],
    // queryParams: ['arena'],
    // originalArena: null,
    init: function () {
        this._super();
        // this.set('originalArena', this.get('model.arena'));
    },
    // arenaChange: function() {
    //     var arena = this.get('model.arena');
    //     console.log(arena);
    //     if (this.get('originalArena')!==(arena)){
    //         // this.set('model.arena', arena);
    //         // hack should probably observe relationship
    //         this.set('relationshipChanged', true);
    //     }
    //     // arena && arena.get('challenges').pushObject(this.get('model'));
    //     return arena;
    // }.observes('model.arena'),
    // arenas: function() {
    //     return this.get('store').find('arena');
    // }.property('@each'),
    actions: {
        run: debounce(function() {
            var model = this.get('model');
            var controller = this;
            var sb = controller.get('sandbox');
            var Runner = require('../../runners/runner');
            var iframeTemplate = require('../../demo/iframe');
            controller.jshint(model.get('solution'), function(code, console, sb) {
                sb.load(iframeTemplate, function() {
                    sb.evaljs(Runner.test(code, model.get('tests')));
                });
            }, {
                sandbox: sb,
                run: true
            });
        }),
        validate: function() {
            this.send('run');
        },
        reset: function() {
            this.get('model').rollback();
        },
        save: function() {
            var that = this;
            this.get('model').save().then(function(ch) {
                this.get('arena.challenges').then(function (challenges) {
                    challenges.pushObject(ch);
                });
                // this.set('relationshipChanged', false); // should happend in an observer
                // this.set('originalArena', this.get('arena'));
                if (App.get('currentPath').contains('create'))
                    that.transitionToRoute('challenge.edit', ch.get('arena'), ch);
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
