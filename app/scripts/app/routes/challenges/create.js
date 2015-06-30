import Ember from 'ember';

module.exports = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin,{
  controllerName: 'challenge.edit',
  // activate: function() {},
  deactivate: function() {
    var model = this.modelFor('challenges.create');
    if(model.get('isNew')) {
      model.deleteRecord();
    }
  },
  // setupController: function(controller, model) {
  //   // controller.needs('challenge.edit').set('model', model);
  // },
  renderTemplate: function() {
    this.render('challenge.edit');
  },
  // beforeModel: function() {},
  // afterModel: function() {},
  
  model: function(params) {
      var arena = this.modelFor('arena');
      return this.store.createRecord('challenge', {
        arena:arena || null
      });
  }
});

export default undefined;
