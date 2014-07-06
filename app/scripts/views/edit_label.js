var EditLabelView = Ember.TextField.extend({
  didInsertElement: function() {
    this.$().focus();
  }
});

Ember.Handlebars.helper('edit-label', EditLabelView);

module.exports =  EditLabelView;