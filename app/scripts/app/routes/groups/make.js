import Ember from 'ember';

module.exports = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin,{
  model: function() {
      return Ember.Object.create({name:'', from:0, to:0});
  }
});

export default undefined;
