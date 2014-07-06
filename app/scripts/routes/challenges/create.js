module.exports = Em.Route.extend({
  // activate: function() {},
  // deactivate: function() {},
  setupController: function(controller, model) {
    this.controllerFor('challengeEdit').set('model', model);
  },
  renderTemplate: function() {
    this.render('challenge.edit');
  },
  // beforeModel: function() {},
  // afterModel: function() {},
  
  model: function() {
      return this.store.createRecord('challenge');
  }
});
