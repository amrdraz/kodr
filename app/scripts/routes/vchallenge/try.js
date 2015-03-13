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
        var vchallenge = this.modelFor('vchallenge');
        var record = this.store.createRecord('trial', {
            vchallenge: vchallenge,
            code: vchallenge.get('setup')
        });
        return record;

    }
});
