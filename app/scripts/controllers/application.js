var ApplicationController = Ember.Controller.extend({
    updateCurrentPath: function() {
        App.set('currentPath', this.get('currentPath'));
    }.observes('currentPath')
});

module.exports = ApplicationController;
