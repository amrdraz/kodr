var ApplicationController = Ember.Controller.extend({
    updateCurrentPath: function() {
        App.set('currentPath', this.get('currentPath'));
    }.observes('currentPath'),
    sockets: {
        notification: function (user, type, value) {
            toaster.info('@'+user.username+' was just awarded '+value+' '+type);
        }
    }
});

module.exports = ApplicationController;
