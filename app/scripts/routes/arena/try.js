module.exports = Em.Route.extend({
    // activate: function() {},
    // deactivate: function() {},
    // setupController: function(controller, model) {
        // this.controllerFor('trial').set('model', model);
    // },
    // renderTemplate: function() {},
    // beforeModel: function() {},
    // afterModel: function() {},

    model: function() {
        var challenge = this.modelFor('arena');
        var record = this.store.createRecord('arenaUser', {
            challenge:challenge,
            code:challenge.get('setup')
        });
        // record.save();
        return record.save();
    }
});
