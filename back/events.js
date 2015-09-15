var observer = require('./observer');
var util = require('util');
var User = require('./models/user');
// var io = require('socket.io-emitter');
var clients = [];

module.exports = function(io) {

    // require('./events/user').sockets(io);
    require('./events/activity');
    require('./events/mail');

    io.sockets.on('connection', function(client) {

        client.on('message', function(msg) {
            io.sockets.emit('message', msg);
        });

        client.on('login', function (id) {
            observer.emit('user.connect', {user_id:id, socket_id:client.id});
        });

        client.on('trial.event', function (event) {
            observer.emit('trial.event', event);
        });

        client.on('disconnect', function() {
            clients.splice(clients.indexOf(client), 1);
            observer.emit('user.disconnect', client.id);
        });

    });

    observer.on('test.socket.respond', function (obj) {
       io.sockets.connected[obj.sid].emit(obj.event, obj.response); 
    });

    observer.on('quest.assign', function (uq) {
        User.getById(uq.user).then(function (user) {
           if(user.socketId && io.sockets.connected[user.socketId]) {
            io.sockets.connected[user.socketId].emit('notification', "A new Quest was just assigned to you");
            }
        });
    });

    observer.on('user.awarded', function(user, type, value) {
        clients.length > 0 && io.emit('notification', user, type, value);
    });
   
};
