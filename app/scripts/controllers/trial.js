var debounce = require('../utils/debounce');
var ChallengeMixin = require('../mixins/challengeMixin');
module.exports = Em.ObjectController.extend(ChallengeMixin, {
    isChallengeTrial: function() {
        return App.get('currentPath').contains('challenge');
    }.property('App.currentPath'),

    breadCrumb: function() {
        return this.get('isChallengeTrial') ? 'edit' : 'arena';
    }.property('isChallengeTrial'),
    breadCrumbPath: function() {
        return this.get('isChallengeTrial') ? 'arena.edit' : 'arenaTrial';
    }.property('isChallengeTrial'),
    needs: ['challenge'],
    //
    init: function() {
        this._super();
    },
    // returns true if dirty but unsaved, so that mock trials show complete instead of resubmit
    isDirtyish: function() {
        return this.get('model.isDirty') && !this.get('model.isNew');
    }.property('model.isDirty', 'model.isNew'),
    
    testError: function (errors) {
        var model = this.get('model');
        model.set('report', {
            errors: errors
        });
        model.set('complete', this._super(errors));
        this.save();
    },
    testSuccess: function(report) {
        var model = this.get('model');
        model.set('report', report);
        model.set('complete', this._super(report));
        this.save();
    },
    save: function() {
        var model = this.get('model');
        if (!this.get('isChallengeTrial')) {
            return model.save();
        }
    },
    actions: {
        run: debounce(function() {
            var model = this.get('model');
            var challenge = this.get('model.challenge');
            var controller = this;
            var sb = controller.get('sandbox');
            var Runner = require('../runners/runner');
            var iframeTemplate = require('../demo/iframe');
            controller.jshint(model.get('code'), function(code, jconsole, sb) {
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
