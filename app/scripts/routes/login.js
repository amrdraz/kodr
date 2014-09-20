module.exports = App.LoginRoute = Em.Route.extend({
  // activate: function() {},
  // deactivate: function() {},
  setupController: function(controller, model) {
    controller.set('model', model);
    controller.setProperties({
        'errorMessage':'',
        'identification':'',
        'password':''
    });
  },
  // renderTemplate: function() {},
  beforeModel: function() {
    if(this.get('session.isAuthenticated')) {
      this.transitionTo('profile');
    }
  },
  // afterModel: function() {},
  
  model: function() {
      return ;
  }
});
