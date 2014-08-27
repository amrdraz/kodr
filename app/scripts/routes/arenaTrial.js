module.exports = Em.Route.extend(SimpleAuth.AuthenticatedRouteMixin,{
  // activate: function() {},
  // deactivate: function() {},
  // setupController: function(controller, model) {},
  // renderTemplate: function() {},
  // beforeModel: function() {},
  // afterModel: function() {},
    model: function(params) {
        var store = this.store;
        return store.find('arena', params.arena_id);
    }
});
