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
    it("return name", function (done) {
        var client = io(setup.url);
 
        client.once("connect", function () {
            client.once("cherryPickedName", function (message) {
                message.should.equal("Draz");
 
                client.disconnect();
                done();
            });
 
            client.emit("cherryPickName");
        });
    });
});
