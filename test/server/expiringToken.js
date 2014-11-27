/*globals before,after,beforeEach,afterEach,describe,it */
var should = require('chai').should();
var assert = require('chai').assert;
var expect = require('chai').expect;
var sinon = require('sinon');
var util = require('util');
var request = require('supertest');
var setup = require('./setup');
var ExpiringToken = require('../../back/models/expiringToken');
var User = require('../../back/models/user');



describe('ExpiringToken', function() {
    before(setup.clearDB);
    after(setup.clearDB);
    describe("Expires", function() {
        var user,expire, clock;
        beforeEach(function (done) {
            clock = sinon.useFakeTimers(0, "setTimeout", "clearTimeout", "setInterval", "clearInterval", "Date");
            User.create({
                username: "amrd",
                email: "amr.m.draz@gmail.com",
                password: "drazdraz12",
                passwordConfirmation: "drazdraz12"
            }).then(function (model) {
                user = model;
                return ExpiringToken.create({
                    user:user._id,
                    'for':ExpiringToken.VERIFICATION,
                    createdAt: new Date()
                });
            }, done)
            .then(function (exp) {
                expire = exp;
                done();
            }, done);
        });
        afterEach(function (done) {
            clock.restore();
            setup.clearDB(done);
        });
        it('should become used', function (done) {
            expire.used.should.be.false;
            ExpiringToken.useToken(expire.id).then(function (exp) {
                exp.used.should.to.be.true;
                done();
            }).catch(done);
        });
        it('should expire after an 24 hours', function (done) {
            clock.tick(1000*60*60*24+1); //1h + 1ms
            ExpiringToken.useToken(expire.id).then(function (exp) {
                expect(exp).to.not.exist;
                done();
            }).catch(done);
        });
    });
    //*/
});
