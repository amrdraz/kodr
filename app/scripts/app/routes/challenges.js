import Ember from 'ember';

module.exports = Ember.Route.extend({
    // activate: function() {},
    // deactivate: function() {},
    // setupController: function(controller, model) {},
    // renderTemplate: function() {},
    // beforeModel: function() {},
    // afterModel: function() {},

    model: function() {
        return this.store.findAll('challenge');
    }
});

export default undefined;
