import Ember from 'ember';

var IndexRoute = require('./routes/index.js');
module.exports = Ember.Route.extend({
  // activate: function() {},
  // deactivate: function() {},
  // setupController: function(controller, model) {}
  // renderTemplate: function() {},
  beforeModel: function() {
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

export default IndexRoute;
