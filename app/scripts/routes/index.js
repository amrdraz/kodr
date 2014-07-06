module.exports = Em.Route.extend({
  // activate: function() {},
  // deactivate: function() {},
  setupController: function(controller, model) {

    controller.set('model', [1,2,3]);
  },
  // renderTemplate: function() {},
  // beforeModel: function() {},
  // afterModel: function() {},
  
  model: function() {
      return [1,2,3];
  }
});
