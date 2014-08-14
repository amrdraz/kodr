/*globals before,beforeEach,after,afterEach,describe,it */

var should = require('chai').should();
var expect = require('chai').expect;
var request = require('supertest');
var Async = require('async');
var setup = require('./setup');
var User = require('../../back/models/user');
var Trial = require('../../back/models/trial');
var Challenge = require('../../back/models/challenge');
var observer = require('../../back/mediator');

describe('User', function() {
    before(setup.clearDB);
    describe('Trial', function() {
        var user, trial, trial2, challenge, challenge2;
        beforeEach(function(done) {
            Async.parallel([

                    function(cb) {
                        User.create({
                            username: 'test',
                            password: 'testmodel'
                        }, function(err, model) {
                            user = model;
                            cb(err, model);
                        });
                    },
                    function(cb) {
                        Challenge.create({
                            exp: 4
                        }, function(err, model) {
                            challenge = model;
                            cb(err, model);
                        });
                    },
                    function(cb) {
                        Challenge.create({
                            exp: 4
                        }, function(err, model) {
                            challenge2 = model;
                            cb(err, model);
                        });
                    }
                ],
                function(err, models) {
                    if (err) return done(err);
                    Trial.create({
                        challenge: challenge._id,
                        user: user._id
                    }, function(err, model) {
                        trial = model;
                        Trial.create({
                            challenge: challenge2._id,
                            user: user._id
                        }, function(err, model) {
                            trial2 = model;
                            done();
                        });
                    });
                }
            );

        });
        afterEach(setup.clearDB);

        it('should increase user exp after completion', function(done) {
            trial.complete = true;
            observer.once('user.awarded', function(user, type, value) {
                user.exp.should.equal(trial.exp);
                done();
            });
            trial.save();
        });
        it('should increase user exp with resepct to all tials completed', function(done) {
            trial.complete = true;
            trial2.complete = true;
            var times = 0;
            observer.on('user.awarded', function(user, type, value) {
                times++;
                // console.log('assigned user exp ', user.exp, ' after adding ', value);

                if (times === 2) {
                    user.exp.should.equal(trial.exp + trial2.exp);
                    done();
                }
            });
            trial.save(function(err, m) {
                trial = m;
                trial2.save(function(err, m) {
                    trial2 = m;
                });
            });

        });
    });
    describe("Auth", function() {
        var url = 'http://localhost:3000';
        var user = {
            username: "amr",
            email: "amr.m.draz@gmail.com",
            password: "draz",
            passwordConfirmation: "draz"
        };
        var accessToken;

        after(function(done) {
            User.findOneAndRemove({
                email: user.email
            }, function(err) {
                if (err) return done(err);
                done();
            });
        });

        describe("Signup", function() {

            it("should add new user by username email and password", function(done) {
                request(url)
                    .post("/signup")
                    .send(user)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        done();
                    });
            });
        });

        describe("Login", function() {

            it("should login with username", function(done) {
                request(url)
                    .post("/token")
                    .send(user)
                    .expect(200)
                    .end(done);
            });

            it("should return a token", function(done) {
                request(url)
                    .post("/token")
                    .send(user)
                    .expect(200)
                // .expect('Content-Type', /json/)
                .end(function(err, res) {
                    if (err) return done(err);

                    res.body.should.have.property("access_token");
                    accessToken = res.body.access_token;
                    done();
                });
            });
        });
        describe("Profile", function() {
            it("access should not work without token", function(done) {
                request(url)
                    .get("/profile")
                    .expect(401)
                    .end(done);
            });

            it("acess should work with token", function(done) {
                request(url)
                    .get("/profile")
                    .set('Authorization', 'Bearer ' + accessToken)
                    .expect(200)
                    .end(done);
            });

            it("should return User object", function(done) {
                request(url)
                    .get("/profile")
                    .set('Authorization', 'Bearer ' + accessToken)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.body.username.should.equal(user.username);
                        res.body.email.should.equal(user.email);
                        res.body.should.have.property("_id");
                        user._id = res.body._id;
                        done();
                    });
            });
        });

        describe("Token", function() {

            it("should not change after User is saved", function(done) {
                request(url)
                    .post("/profile")
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send({
                        username: 'draz'
                    })
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        request(url)
                            .get("/profile")
                            .set('Authorization', 'Bearer ' + accessToken)
                            .end(function(err, res) {
                                if (err) return done(err);
                                res.status.should.equal(200);
                                res.body.username.should.not.equal(user.username);
                                user.username = res.body.username;
                                user.oldPassword = res.body.password;

                                request(url)
                                    .post("/token")
                                    .send(user)
                                    .end(function(err, res) {
                                        if (err) return done(err);
                                        res.status.should.equal(200);
                                        res.body.access_token.should.equal(accessToken);
                                        done();
                                    });
                            });
                    });

            });

            it("should change after User password is changed", function(done) {
                request(url)
                    .post("/profile")
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send({
                        password: 'amr'
                    })
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);

                        request(url)
                            .post("/token")
                            .send({
                                username: 'draz',
                                password: 'amr'
                            })
                            .expect(200)
                            .end(function(err, res) {
                                if (err) return done(err);
                                res.body.access_token.should.not.equal(accessToken);
                                accessToken = res.body.access_token;
                                done();
                            });
                    });
            });
        });



    });
    //*/
});
