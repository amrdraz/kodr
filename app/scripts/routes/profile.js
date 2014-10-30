var ProfileRoute = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin);

ProfileRoute.reopen({
    controllerName: 'user.index',
    setupController: function(controller, model) {
        model.reload();
        model.get('userQuests');
        controller.set('model', model);
    },
    renderTemplate: function() {
        this.render('user.index');
    },
    model: function() {
        return this.get('session.user');
    }
});

module.exports = ProfileRoute;
