/*globals before,beforeEach,after,afterEach,describe,it */
var should = require('chai').should();
var assert = require('chai').assert;
var expect = require('chai').expect;
var request = require('supertest');
var util = require('util');
var Async = require('async');
var setup = require('./setup');
var Trial = require('../../back/models/trial');
var User = require('../../back/models/user');
var Challenge = require('../../back/models/challenge');
var observer = require('../../back/mediator');



describe('Trial', function() {
    before(function(done) {
        return setup.clearDB(done);
    });

    describe('Integration', function() {
        var trial, challenge,challenge2, user;
        beforeEach(function(done) {
            Async.parallel([

                    function(cb) {
                        User.create({
                            username:'test',
                            password:'testmodel12'
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
                            exp: 8
                        }, function(err, model) {
                            challenge2 = model;
                            cb(err, model);
                        });
                    }
                ],
                function(err, models) {
                    if(err) return done(err);
                    Trial.create({
                        challenge: challenge._id,
                        user: user._id
                    }, function(err, model) {
                        trial = model;
                        done();
                    });
                }
            );

        });
        afterEach(setup.clearDB);
        it('should have exp set only first time', function(done) {
            trial.complete = true;
            trial.save(function(err, trial) {
                if (err) return done(err);
                trial.exp.should.equal(challenge.exp);
                trial.save(function(err, trial) {
                    trial.exp.should.equal(challenge.exp);
                    done();
                });
            });
        });
        it('should count the number of times challenge was completed', function(done) {
            trial.complete = true;
            trial.save(function(err, trial) {
                if (err) return done(err);
                trial.completed.should.equal(1);
                trial.save(function(err, trial) {
                    trial.completed.should.equal(2);
                    done();
                });
            });
        });

        it('should fire complete event work with different trials', function(done) {
            var times = 0;
            observer.on('trial.complete',function (trial) {
                times++;
                // util.log(['completed',times,'trial',trial._id,'awards',trial.exp, 'exp to user '].join(' '));
                if(times===2) {
                    done();
                }
            });
            Trial.create({
                challenge:challenge2._id,
                user:user._id
            },
            function (err, trial2) {
                trial.complete = true;
                trial2.complete = true;
                // util.log('saveing trial '+trial._id);
                trial.save();
                // util.log('saveing trial2 '+trial2._id);
                trial2.save();
            });            
        });
    });

    describe("API", function() {
        var url = 'http://localhost:3000';
        var api = url + '/api';
        var user = {
            username: "amrd",
            email: "amr.m.draz@gmail.com",
            password: "drazdraz12",
            passwordConfirmation: "drazdraz12"
        };
        var accessToken;
        var challenge = {
            challenge: {
                name: 'Basic Test',
                setup: "",
                solution: "var x = 20;",
                tests: "",
                description: "create a variable and assign to it the value 20",
                exp: 2,
                isPublished: false
            }
        };
        var trial = {
            trial: {
                code: challenge.setup,
                complete: false,
                tests: {},
                challenge: null,
                user: null
            }
        };


        before(function(done) {
            request(url)
                .post("/signup")
                .send(user)
                .end(function(err, res) {
                    if (err) return done(err);
                    console.log(res.text);
                    expect(res.status).to.equal(200);
                    request(url)
                        .post("/token")
                        .send(user)
                        .end(function(err, res) {
                            if (err) return done(err);
                            expect(res.status).to.equal(200);
                            accessToken = res.body.access_token;
                            request(api)
                                .post("/challenges")
                                .set('Authorization', 'Bearer ' + accessToken)
                                .send(challenge)
                                .end(function(err, res) {
                                    if (err) return done(err);
                                    res.status.should.equal(200);
                                    challenge.id = res.body.challenge._id;
                                    trial.trial.challenge = challenge.id;
                                    done();
                                });
                        });
                });
        });

        after(setup.clearDB);

        describe("POST", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .post("/trials")
                    .send(trial)
                    .expect(401)
                    .end(done);
            });

            it("should create a trial", function(done) {
                request(api)
                    .post("/trials")
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send(trial)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.trial.times.should.equal(0);
                        trial.id = res.body.trial._id;
                        done();
                    });
            });
        });

        describe("GET", function() {

            it("should return a trial by id", function(done) {
                request(api)
                    .get("/trials/" + trial.id)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.trial._id.should.exist;
                        done();
                    });
            });

            it("should return a list of all trials", function(done) {
                request(api)
                    .get("/trials")
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.trial.length.should.equal(1);
                        done();
                    });
            });

        });

        describe("PUT", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .put("/trials/" + trial.id)
                    .send(trial)
                    .expect(401)
                    .end(done);
            });

            it("should update a trial without user", function(done) {
                request(api)
                    .put("/trials/" + trial.id)
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send({
                        trial: {
                            complete: true
                        }
                    })
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.trial.complete.should.be.true;
                        trial.complete = res.body.trial.complete;
                        done();
                    });
            });
        });

        describe("DELETE", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .del("/trials/" + trial.id)
                    .expect(401)
                    .end(done);
            });

            it("should delete a trial without user", function(done) {
                request(api)
                    .del("/trials/" + trial.id)
                    .set('Authorization', 'Bearer ' + accessToken)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        Trial.findById(trial.id, function(err, model) {
                            expect(model).to.not.exist;
                            done();
                        });
                    });
            });
        });

    });
    //*/
});
