var debounce = require('../../utils/debounce');
var ChallengeMixin = require('../../mixins/challengeMixin');
module.exports = Em.ObjectController.extend(ChallengeMixin, {
    needs: ['challenge', 'arena'],
    arena: Ember.computed.alias("controllers.arena"),
    breadCrumb: 'edit',
    breadCrumbPath: 'arena.edit',
    evaluates: 'solution',
    // queryParams: ['arena'],
    // originalArena: null,
    init: function() {
        this._super();
    },
    isCreating: function () {
        return App.get('currentPath').contains('create');
    }.property('App.currentPath'),
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
        toastr.error('There are Errors check Console');
        this.set('model.valid', this._super(error));
        this.unPublish();
        this.save();
    },
    testSuccess: function(report) {
        var model = this.get('model');
        var result = this._super(report);

        model.set('valid', result);
        if (result) {
            toastr.success('All Clear' + (this.get('model.isPublished') ? '' : ' you can now publish'));
        } else {
            toastr.error('Tests didn\'t pass check console');
            this.unPublish();
        }
        this.save();
    },
    evaluate: function() {

        var model = this.get('model');
        var controller = this;
        var sb = controller.get('sandbox');
        var Runner = require('../../runners/runner');
        var iframeTemplate = require('../../demo/iframe');

        this.trigger('showConsole');
        controller.jshint(model.get('solution'), function(code, console, sb) {
            sb.load(iframeTemplate, function() {
                sb.evaljs(Runner.test(code, model.get('tests')));
            });
        }, {
            sandbox: sb,
            run: true
        });
    },
    save: function() {
        var model = this.get('model');
        var that = this;
        if (this.get('isCreating')) {
            return model.save().then(function(ch) {
                // debugger;
                that.transitionToRoute('challenge.edit', ch.id);
            }, function(xhr) {
                console.error(xhr.message);
                toastr.error(xhr.message);
            });
        } else {
            return model.save();
        }
    },
    actions: {
        run: debounce(function() {
            this.evaluate();
        }),
        validate: function() {
            this.evaluate();
        },
        reset: function() {
            this.get('model.canReset') && this.get('model').rollback();
        },
        save: function() {
            var model = this.get('model');
            if (model.get('canSave')) {
                if (!model.get('valid') && model.get('isPublished')) {
                    this.evaluate();
                    return false;
                }
                this.save();
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
                    this.save().then(function(ch) {
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
            this.save().then(function(ch) {
                console.log('unPublished');
            });
        }

    }
});
