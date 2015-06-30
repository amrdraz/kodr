import Ember from 'ember';

module.exports = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin,{
  controllerName: 'user.edit',
  // activate: function() {},
  deactivate: function() {
    var model = this.modelFor('users.create');
    if(model && model.get('isNew')) {
      model.deleteRecord();
    }
  },
  // setupController: function(controller, model) {
  //   this.controllerFor('groupEdit').set('model',model);
  // },
  renderTemplate: function() {
    this.render('user.edit');
  },
  // beforeModel: function() {},
  // afterModel: function() {},
  
  model: function() {
      return this.store.createRecord('user');
  }
});

export default undefined;
