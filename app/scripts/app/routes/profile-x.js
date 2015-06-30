var ProfileRoute = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin);

ProfileRoute.reopen({
    controllerName: 'user.index',
    setupController: function(controller, model) {
        model.reload();
        model.get('userQuests');
        model.get('memberships');
        controller.set('model', model);
    },
    renderTemplate: function() {
        this.render('user.index');
    },
    afterModel:function (model) {
        return Em.RSVP.all([
            model.get('userQuests'),
            model.get('memberships')
        ]); 
    },
    model: function() {
        return this.get('session.user');
    }
});

module.exports = ProfileRoute;
