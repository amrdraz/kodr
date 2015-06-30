import Ember from 'ember';

var GroupRoute = require('./routes/group');
module.exports = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin,{
  // activate: function() {},
  // deactivate: function() {},
  // setupController: function(controller, model) {},
  // renderTemplate: function() {},
  // beforeModel: function() {},
  // afterModel: function() {},
  
  model: function(params) {
      return this.store.find('group', params.group_id);
  }
});

export default GroupRoute;
