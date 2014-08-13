module.exports = Em.Route.extend({
  // activate: function() {},
  // deactivate: function() {},
  setupController: function(controller, model) {
    this.controllerFor('arenaEdit').set('model', model);
  },
  renderTemplate: function() {
    this.render('arena.edit');
  },
  // beforeModel: function() {},
  // afterModel: function() {},
  
  model: function() {
      return this.store.createRecord('arena').save();
  }
});
