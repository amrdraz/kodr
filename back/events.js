var observer = require('./observer');
var util = require('util');
// var io = require('socket.io-emitter');
var clients = [];

module.exports = function(io) {

    // require('./events/user').sockets(io);
    require('./events/activity');

    io.sockets.on('connection', function(client) {

        client.on('message', function(msg) {
            io.sockets.emit('message', msg);
        });

        client.on('login', function (id) {
            observer.emit('user.connect', {user_id:id, socket_id:client.id});
        });

        client.on('disconnect', function() {
            clients.splice(clients.indexOf(client), 1);
            observer.emit('user.disconnect', client.id);
        });

    });

    observer.on('test.socket.respond', function (obj) {
       io.sockets.connected[obj.sid].emit(obj.event, obj.response); 
    });

    observer.on('user.awarded', function(user, type, value) {
        clients.length > 0 && io.emit('notification', user, type, value);
    });
   
};
