var observer = require('./mediator');
var client;

module.exports = function(io) {

    io.on('connection', function(socket) {
        client = socket;
        /**
         * Updates the content when the `applyFilterByWord` event has been received.
         *
         * @on cherryPickName
         */
        client.on('cherryPickName', function() {
            client.emit('cherryPickedName', "Draz");
        });

        client.on('pick name like this', function(name) {
            client.emit('pick name like this', _.sample(names), Math.floor(Math.random() * 30) + 1);
        });
    });
    //server events
    observer.on('user.awarded', function(user, type, value) {
        client && client.emit('notification', user, type, value);
    })
};
