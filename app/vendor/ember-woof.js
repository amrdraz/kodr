Ember.Application.initializer({
  name: "registerWoofMessages",

  initialize: function(container, application) {
    application.register('woof:main', Ember.Woof);
  }
});

Ember.Woof = Ember.ArrayProxy.extend({
  content: Ember.A(),
  timeout: 5000,
  pushObject: function(object) {
    object.typeClass = 'alert-' + object.type;
    this._super(object);
  },
  danger: function(message) {
    this.pushObject({
      type: 'danger',
      message: message
    });
  },
  warning: function(message) {
    this.pushObject({
      type: 'warning',
      message: message
    });
  },
  info: function(message) {
    this.pushObject({
      type: 'info',
      message: message
    });
  },
  success: function(message) {
    this.pushObject({
      type: 'success',
      message: message
    });
  }
});

Ember.Handlebars.helper('capitalize', function(value) {
  return value.capitalize();
});

Ember.Application.initializer({
  name: "injectWoofMessages",

  initialize: function(container, application) {
    application.inject('controller', 'woof', 'woof:main');
    application.inject('component',  'woof', 'woof:main');
    application.inject('route',      'woof', 'woof:main');
  }
});
