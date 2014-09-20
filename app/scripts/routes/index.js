module.exports = Em.Route.extend({
  // activate: function() {},
  // deactivate: function() {},
  // setupController: function(controller, model) {}
  // renderTemplate: function() {},
  beforeModel: function() {
    debugger;
    if(this.get('session.isAuthenticated')) {
      this.transitionTo('arenas');
    } else {
      this.transitionTo('login');
    }
  },
  // afterModel: function() {},
  
  // model: function() {
  //     return [1,2,3];
  // }
});
