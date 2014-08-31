module.exports = Em.Route.extend(SimpleAuth.AuthenticatedRouteMixin,{
  controllerName: 'group.edit',
  // activate: function() {},
  deactivate: function() {
    var model = this.modelFor('groups.create');
    if(model && model.get('isNew')) {
      model.deleteRecord();
    }
  },
  // setupController: function(controller, model) {
  //   this.controllerFor('groupEdit').set('model',model);
  // },
  renderTemplate: function() {
    this.render('group.edit');
  },
  // beforeModel: function() {},
  // afterModel: function() {},
  
  model: function() {
      return this.store.createRecord('group');
  }
});
