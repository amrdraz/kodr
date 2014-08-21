var ProfileRoute = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin);

ProfileRoute.reopen({
    model: function () {
        return Em.$.get('profile');
    }
});

module.exports = ProfileRoute;

