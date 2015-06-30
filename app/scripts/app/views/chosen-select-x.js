import Ember from 'ember';

var ChosenSelectView = Ember.Select.extend({
  attributeBindings: ['prompt:data-placeholder'],
  templateName: 'chosen-select',

  renderChosen: function() {
    this.$().chosen();
  }.on('didInsertElement'),

  watch: function() {
    Ember.run.sync();
    Ember.run.scheduleOnce('afterRender', this, function() {
      if (this.get('_state') === 'inDOM') {
        this.$().trigger('chosen:updated');
      }
    });
  }.observes('content.@each'), // If content is a property on the view you can just use content.[]
  
});

export default ChosenSelectView;
