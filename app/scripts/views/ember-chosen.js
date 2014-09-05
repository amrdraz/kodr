App.UnboundSelectOptionView = Ember.SelectOption.extend({
  template: Ember.Handlebars.compile('{{unbound view.label}}'),

  label: function() {
    return this;
  }.property(),
});

App.ChosenSelectView = Em.Select.extend({
  attributeBindings: ['prompt:data-placeholder'],
  templateName: 'chosen-select',

  renderChosen: function() {
    this.$().chosen();
  }.on('didInsertElement'),

  watch: function() {
    Em.run.sync();
    Em.run.scheduleOnce('afterRender', this, function() {
      if (this.get('_state') === 'inDOM') {
        this.$().trigger('chosen:updated');
      }
    });
  }.observes('content.@each.data'), // If content is a property on the view you can just use content.[]
  
});

Em.Handlebars.helper('chosen', App.ChosenSelectView);
