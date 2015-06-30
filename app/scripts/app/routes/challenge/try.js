module.exports = Em.Route.extend({
    // activate: function() {},
    // deactivate: function() {},
    setupController: function(controller, model) {
        this.controllerFor('trial').set('model', model);
    },
    renderTemplate: function() {
        this.render('trial');
    },
    // beforeModel: function() {},
    // afterModel: function() {},

    model: function(params) {
        var challenge = this.modelFor('challenge');
        var record = this.store.createRecord('trial', {
            challenge: challenge,
            code: challenge.get('setup')
        });
        return record;

    }
});
