/*globals before,after,beforeEach,afterEach,describe,it */
var should = require('chai').should();
var assert = require('chai').assert;
var expect = require('chai').expect;
var sinon = require('sinon');
var util = require('util');
var io = require('socket.io-client');
var setup = require('./setup');



describe('Socket', function() {
    before(setup.clearDB);
    after(setup.clearDB);

    var options = {
        'force new connection': true
    };
    it('Should be able to broadcast messages', function(done) {
        var client1, client2, client3;
        var message = 'Hello World';
        var messages = 0;

        var checkMessage = function(client) {
            client.on('message', function(msg) {
                message.should.equal(msg);
                client.disconnect();
                messages++;
                if (messages === 3) {
                    done();
                };
            });
        };

        client1 = io.connect(setup.url, options);
        checkMessage(client1);

        client1.on('connect', function(data) {
            client2 = io.connect(setup.url, options);
            checkMessage(client2);

            client2.on('connect', function(data) {
                client3 = io.connect(setup.url, options);
                checkMessage(client3);

                client3.on('connect', function(data) {
                    client2.send(message);
                });
            });
        });
    });

    // it('Should be able to send private messages', function(done) {
    //     var client1, client2, client3;
    //     var message = {
    //         to: chatUser1.name,
    //         txt: 'Private Hello World'
    //     };
    //     var messages = 0;

    //     var completeTest = function() {
    //         messages.should.equal(1);
    //         client1.disconnect();
    //         client2.disconnect();
    //         client3.disconnect();
    //         done();
    //     };

    //     var checkPrivateMessage = function(client) {
    //         client.on('private message', function(msg) {
    //             message.txt.should.equal(msg.txt);
    //             msg.from.should.equal(chatUser3.name);
    //             messages++;
    //             if (client === client1) {
    //                 // The first client has received the message
    //     // we give some time to ensure that the others
    //     // will not receive the same message. 
    //                 setTimeout(completeTest, 40);
    //             };
    //         });
    //     };

    //     client1 = io.connect(setup.url, options);
    //     checkPrivateMessage(client1);

    //     client1.on('connect', function(data) {
    //         client1.emit('connection name', chatUser1);
    //         client2 = io.connect(setup.url, options);
    //         checkPrivateMessage(client2);

    //         client2.on('connect', function(data) {
    //             client2.emit('connection name', chatUser2);
    //             client3 = io.connect(setup.url, options);
    //             checkPrivateMessage(client3);

    //             client3.on('connect', function(data) {
    //                 client3.emit('connection name', chatUser3);
    //                 client3.emit('private message', message)
    //             });
    //         });
    //     });
    // });
});
