import Ember from 'ember';

var QuestRoute = require('./routes/quest');
module.exports = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin,{
  // activate: function() {},
  // deactivate: function() {},
  // setupController: function(controller, model) {},
  // renderTemplate: function() {},
  // beforeModel: function() {},
  // afterModel: function() {},
  
  // model: function(params) {
  //     return this.store.find('arena', params.arena_id);
  // }
});

export default QuestRoute;
