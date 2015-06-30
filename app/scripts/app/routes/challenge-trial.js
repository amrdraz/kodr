import Ember from 'ember';
import DS from 'ember-data';

var ChallengeTrialRoute = require('./routes/challengeTrial');
module.exports = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin, {
    // activate: function() {},
    // deactivate: function() {},
    // setupController: function(controller, model) {},
    // renderTemplate: function() {},
    afterModel: function(trial) {
      this.transitionTo('trial', trial.get('arena'), trial);
    },
    // afterModel: function() {},
    model: function(params) {
        var store = this.store;
        return DS.PromiseObject.create({
            promise: Ember.$.ajax({
                url: 'api/trials',
                method: 'POST',
                data: {
                    trial: {
                        challenge: params.challenge_id,
                        user: this.get('session.user_id')
                    }
                }
            }).then(function(response) {
                var trial = response.trial;
                trial.id = trial._id;
                trial = store.push('trial', trial);
                return trial;
            })
        });
    }
});

export default ChallengeTrialRoute;
