var toastr = require('toastr');
var debounce = require('../../utils/debounce');
var VChallengeMixin = require('../../mixins/vchallengeMixin');
module.exports = Em.ObjectController.extend(VChallengeMixin, {
    needs: ['vchallenge', 'arena'],
    arena: Ember.computed.alias("vcontrollers.arena"),
    breadCrumb: 'edit',
    breadCrumbPath: 'arena.edit',
    evaluates: 'solution',
    challengeLanguages:['javascript','java'],
    // queryParams: ['arena'],
    // originalArena: null,
    init: function() {
        this._super();
    },
    isCreating: function () {
        return App.get('currentPath').split('.').contains('create');
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
    publish: function() {
        if (this.get('intentToPublish')) {
            this.set('intentToPublish', false);
            this.set('isPublished', true);
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
        // console.log(report);
        if(report.score<model.get('exp')) {
            this.get('console').Write('Awarded ('+report.score+"/"+model.get('exp')+') - Solution to vchallenge should reach maximum score tests','error');
            result = false;
        }

        model.set('valid', result);
        if (result) {
            this.publish();
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
    valueWillChange: function(obj, key, value){
        this['changing'+key] = obj.get(key);
        // console.log('changing',key, obj.get(key));
    }.observesBefore('model.solution', 'model.setup', 'model.tests'),
    invalidate: function (obj, key, value) {
        // console.log('to',key, obj.get(key));
        var change  = this['changing'+key] === obj.get(key);
        this.set('model.valid', change && this.get('model.valid'));
    }.observes('model.solution', 'model.setup', 'model.tests'),
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
            var controller = this;
            var model = controller.get('model');
            if(model.get('isJava')) {
                controller.trigger('showConsole');
                controller.get('console').Write('Compiling...\n');
                controller.runInServer(model.get('solution'), model,function (res) {
                    controller.get('console').Write('Compiled\n',res.sterr?'error':'result');
                    if(res.sterr){
                        controller.get('console').Write(res.sterr,'error');
                        controller.trigger('lintCode', 'solution',controller.parseSterr(res.sterr));
                    } else {
                        controller.get('console').Write(res.stout);
                        controller.trigger('lintCode', 'solution',[]);
                    }
                });
            } else {
                this.send('runInConsole');
            }
        }),
        validate: function() {
            var controller = this;
            var model = controller.get('model');
            if(model.get('isJava')) {
                controller.trigger('showConsole');
                controller.get('console').Write('Running Tests...\n');
                controller.testInServer(model.get('solution'), model,function (res) {
                    controller.get('console').Write('Compiled\n',res.sterr?'error':'result');
                    if(res.sterr){
                        controller.get('console').Write(res.sterr,'error');
                        controller.trigger('lintCode', 'solution',controller.parseSterr(res.sterr));
                    } else {
                        controller.testSuccess(res.report);
                        controller.trigger('lintCode', 'solution',[]);
                    }
                });
            } else {
                this.evaluate();
            }
        },
        reset: function() {
            this.get('model.canReset') && this.get('model').rollback();
        },
        save: function() {
            var model = this.get('model');
            if (model.get('canSave')) {
                if (model.get('isPublished')) {
                    this.send('validate');
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
            var that = this;
            var model = this.get('model');
            if (!model.get('isPublished')) {
                this.set('intentToPublish', true);
                if (model.get('valid')) {
                    this.publish();
                    this.save().then(function(ch) {
                        console.log('published');
                    }).catch(function(err) {
                        console.log(err.stack);
                    });
                } else {
                    this.send('validate');
                }
            }
        },
        unPublish: function() {
            this.set('model.isPublished', false);
            this.save().then(function(ch) {
                console.log('unPublished');
            });
        },
        addInput: function() {
            var controller = this;
            var model = controller.get('model');
            if(model.get('isJava')) {
                var ins = model.get("inputs").pushObject(Em.Object.create({value:""}));
            }
        },
        removeInput: function(inp) {
            var controller = this;
            var model = controller.get('model');
            if(model.get('isJava')) {
                var ins = model.get("inputs").removeObject(inp);
            }
        },

    }
});
