import Ember from 'ember';

module.exports = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin,{
    // activate: function() {},
    // deactivate: function() {},
    setupController: function(controller, model) {
        model.reload();
        controller.set('model', model);
    },
    // renderTemplate: function() {},
    // beforeModel: function() {},
    // afterModel: function() {},

    model: function() {
        return this.modelFor('quest');
    }
});

export default undefined;
