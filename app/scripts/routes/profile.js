var ProfileRoute = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin);

ProfileRoute.reopen({
    model: function () {
        return this.get('session.user');
    }
});

module.exports = ProfileRoute;

