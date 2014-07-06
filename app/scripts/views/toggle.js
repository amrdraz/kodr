module.exports = App.ToggleView = Em.View.extend({
  tagName: 'li',
  classNameBindings: ['toggle:disabled'],
  value: function () {
      return this.get('toggle')?this.get('primary'):this.get('secondary');
  }.property()
});
