var ProfileRoute = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin);

ProfileRoute.reopen({
    controllerName: 'user.index',
    renderTemplate: function() {
        this.render('user.index');
    },
    model: function() {
        return this.get('session.user');
    }
});

module.exports = ProfileRoute;
