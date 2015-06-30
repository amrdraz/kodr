import Ember from 'ember';

var LoginRoute = Ember.Route.extend({
  // activate: function() {},
  // deactivate: function() {},
  setupController: function(controller, model, queryParams) {
    controller.set('model', model);
    controller.set('email', queryParams.email);
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
  
  // model: function() {
  //     return ;
  // }
});

export default LoginRoute;
