module.exports = Em.Route.extend({
    // activate: function() {},
    // deactivate: function() {},
    // setupController: function(controller, model) {
        // this.controllerFor('trial').set('model', model);
    // },
    // renderTemplate: function() {},
    beforeModel: function() {
        var challenge = this.modelFor('challenge');
        this.transitionTo('arenaTrial.try', this.store.create('trial', {
            challenge:challenge
        }).save());
    },
    // afterModel: function() {},

    // model: function() {
    //     var challenge = this.modelFor('challenge');
    //     return challenge;
    // }
});
