var debounce = require('../../utils/debounce');
var ChallengeMixin = require('../../mixins/challengeMixin');
module.exports = Em.ObjectController.extend(ChallengeMixin, {
    needs: ['challenge', 'arena'],
    arena: Ember.computed.alias("controllers.arena"),
    breadCrumb:'arena',
    breadCrumbPath:'arena.edit' ,
    evaluates: 'solution',
    // queryParams: ['arena'],
    // originalArena: null,
    init: function() {
        this._super();
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
    unPublish: function() {
        if (this.get('model.isPublished')) {
            this.set('model.isPublished', false);
        }
    },
    testError: function(error) {
        this.woof.danger('There are Errors check Console');
        this.set('model.valid', this._super(error));
        this.unPublish();
        this.get('model').save();
    },
    testSuccess: function(report) {
        var model = this.get('model');
        var result = this._super(report);

        model.set('valid', result);
        if (result) {
            this.woof.success('All Clear' + (this.get('model.isPublished') ? '' : ' you can now publish'));
        } else {
            this.woof.danger('Tests didn\'t pass check console');
            this.unPublish();
        }
        model.save();
    },
    evaluate: function() {
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
    },
    actions: {
        run: debounce(function() {
            this.evaluate();
        }),
        validate: function() {
            if (!this.get('valid'))
                this.evaluate();
        },
        reset: function() {
            this.get('model.canReset') && this.get('model').rollback();
        },
        save: function() {
            var that = this;
            var model = this.get('model');
            if (model.get('canSave')) {
                if (!model.get('valid') || model.get('isPublished')) {
                    that.evaluate();
                } else {
                    that.get('model').save().then(function(ch) {
                        var arena = that.get('arena');
                        if (arena) {
                            arena.get('challenges').then(function(challenges) {
                                challenges.pushObject(ch);
                            });
                        }
                        // this.set('relationshipChanged', false); // should happend in an observer
                        // this.set('originalArena', this.get('arena'));
                        if (App.get('currentPath').contains('create')) {
                            that.transitionToRoute('challenge.edit', that.get('model'));
                        }
                    }).catch(function(xhr) {
                        console.error(xhr);
                        that.woof.danger(xhr.message);
                    });
                }
            }
        },
        delete: function() {
            var arena = this.get('arena');
            this.get('model').destroyRecord();
            if (arena) {
                this.transitionToRoute('arena.edit');
            } else {
                this.transitionToRoute('challenges');
            }
        },
        publish: function() {
            var model = this.get('model');
            if (!model.get('isPublished')) {
                if (model.get('valid')) {
                    model.set('isPublished', true);
                    model.save().then(function(ch) {
                        console.log('published');
                    }).catch(function(err) {
                        console.log(err.stack);
                    });
                } else {
                    this.evaluate();
                }
            }
        },
        unPublish: function() {
            this.set('model.isPublished', false);
            this.get('model').save().then(function(ch) {
                console.log('unPublished');
            });
        }

    }
});
