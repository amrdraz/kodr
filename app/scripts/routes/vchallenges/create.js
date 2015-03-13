module.exports = Em.Route.extend(SimpleAuth.AuthenticatedRouteMixin,{
  controllerName: 'vchallenge.edit',
  // activate: function() {},
  deactivate: function() {
    var model = this.modelFor('vchallenges.create');
    if(model.get('isNew')) {
      model.deleteRecord();
    }
  },
  // setupController: function(controller, model) {
  //   // controller.needs('challenge.edit').set('model', model);
  // },
  renderTemplate: function() {
    this.render('vchallenge.edit');
  },
  // beforeModel: function() {},
  // afterModel: function() {},
  
  model: function(params) {
      var arena = this.modelFor('arena');
      return this.store.createRecord('vchallenge', {
        arena:arena || null
      });
  }
});
