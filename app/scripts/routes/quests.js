module.exports = Em.Route.extend(SimpleAuth.AuthenticatedRouteMixin,{
    // activate: function() {},
    // deactivate: function() {},
    // setupController: function(controller, model) {},
    // renderTemplate: function() {},
    // beforeModel: function() {},
    // afterModel: function() {},

    model: function() {
        return this.store.find('quest');
    }
});
