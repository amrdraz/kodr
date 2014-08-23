module.exports = Em.Route.extend({
    // activate: function() {},
    // deactivate: function() {},
    // setupController: function(controller, model) {
    //     this.controllerFor('challenge.try').set('model', model);
    // },
    // renderTemplate: function() {},
    // beforeModel: function() {},
    // afterModel: function() {},

    model: function(params) {
        var challenge = this.modelFor('challenge');
        if (challenge) {
            var record = this.store.createRecord('trial', {
                challenge: challenge,
                code: challenge.get('setup')
            });
            return record;
        } else {
            return this.store.find('trial', params.trial_id);
        }

    }
});
