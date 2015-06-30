import Ember from 'ember';

module.exports = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin,{
    // activate: function() {},
    // deactivate: function() {},
    setupController: function(controller, model) {
        model.reload();
        controller.set('model', model);
        // model.get('members').then(function (ms) {
        //     controller.get('selected').push(ms);
        // });
    },
    // renderTemplate: function() {},
    // beforeModel: function() {},
    // afterModel: function() {},

    model: function() {
        return this.modelFor('group');
    }
});

export default undefined;
