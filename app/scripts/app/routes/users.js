import Ember from 'ember';

// UserRoute = require('./routes/user');
// UserIndexRoute = require('./routes/user/index');
// UserEditRoute = require('./routes/user/edit');

var UsersRoute = require('./routes/users');
module.exports = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin,{
  // activate: function() {},
  // deactivate: function() {},
  // setupController: function(controller, model) {},
  // renderTemplate: function() {},
  // beforeModel: function() {},
  // afterModel: function() {},
  
  model: function(params) {
      return this.store.find('user');
  }
});

export default UsersRoute;
