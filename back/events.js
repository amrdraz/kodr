var observer = require('./observer');
var util = require('util');
var clients = [];

module.exports = function(io) {

    // require('./events/user').sockets(io);
    // require('./events/trial')(io);

    io.on('connection', function(socket) {

        // util.log("New player has connected: " + socket.id);
        clients.push(socket);

        socket.on('message', function(msg) {
            io.sockets.emit('message', msg);
        });

    });
    //server events
    observer.on('user.awarded', function(user, type, value) {
        clients.length > 0 && io.emit('notification', user, type, value);
    });
};
