import Ember from 'ember';
import ChosenSelectView from '/kodr/views/chosen-select-x';

var UnboundSelectOptionView = Ember.SelectOption.extend({
  template: Ember.Handlebars.compile('{{unbound view.label}}'),

  label: function() {
    return this;
  }.property(),
});
Ember.Handlebars.helper('chosen', ChosenSelectView);

export default UnboundSelectOptionView;
