var toastr = require('toastr');
var ApplicationController = Ember.Controller.extend({
    updateCurrentPath: function() {
        App.set('currentPath', this.get('currentPath'));
    }.observes('currentPath'),
    sockets: {
        notification: function(user, type, value) {
            console.log(arguments);
            if(this.get('session.isTeacher'))
                toastr.info('@' + user.username + ' was just awarded ' + value + ' ' + type);
        },
        // When EmberSockets makes a connection to the Socket.IO server.
        connect: function() {
            if(this.get('session.isAuthenticated')) {
                this.socket.emit('login', this.get('session.user_id'));
            }
            console.log('EmberSockets has connected...');
        },

        // When EmberSockets disconnects from the Socket.IO server.
        disconnect: function() {
            console.log('EmberSockets has disconnected...');
        }
    }
});

module.exports = ApplicationController;
