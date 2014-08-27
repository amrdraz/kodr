module.exports = Em.Route.extend(SimpleAuth.AuthenticatedRouteMixin,{
    // activate: function() {},
    // deactivate: function() {},
    // setupController: function(controller, model) {
    //     controller.set('model', model);
    //     // controller.set('currentChallenge', model.get('arena.challenges.lastObject'));
    // },
    // renderTemplate: function() {},
    // beforeModel: function() {},
    model: function(params) {
        return this.store.createRecord('arenaTrial', {
            arena:this.modelFor('arenaTrial')
        }).save();
    }
});
