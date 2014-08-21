module.exports = Em.Route.extend({
  controllerName: 'challenge.edit',
  // activate: function() {},
  // deactivate: function() {},
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
