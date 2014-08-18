/*globals before,beforeEach,after,afterEach,describe,it */
var should = require('chai').should();
var assert = require('chai').assert;
var expect = require('chai').expect;
var request = require('supertest-as-promised');
var util = require('util');
var Promise = require("bluebird");
var setup = require('./setup');
var User = require('../../back/models/user');
var Challenge = require('../../back/models/challenge');
var Trial = require('../../back/models/trial');
var Arena = require('../../back/models/arena');
var ArenaTrial = require('../../back/models/arenaTrial');
var observer = require('../../back/mediator');



describe('ArenaTrial', function() {
    before(function(done) {
        return setup.clearDB(done);
    });

    describe('Integration', function() {
        var arena, arenaTrial, challenge, challenge2, user;
        beforeEach(function(done) {
            Promise.fulfilled()
                .then(function() {
                    var ar = Arena.create({});
                    var usr = User.create({
                        username: 'test',
                        password: 'testmodel'
                    });
                    return [ar, usr];
                })
                .spread(function(ar, usr) {
                    arena = ar;
                    user = usr;
                    var at = ArenaTrial.create({
                        arena: arena._id,
                        user: user._id
                    });
                    var ch = Challenge.create({
                        exp: 4,
                        arena: arena._id
                    });
                    var ch2 = Challenge.create({
                        exp: 2,
                        arena: arena._id
                    });
                    return [at, ch, ch2];
                })
                .spread(function(at, ch1, ch2) {
                    challenge = ch1;
                    challenge2 = ch2;
                    arenaTrial = at;
                    done();
                }).catch(done);

        });
        afterEach(setup.clearDB);
        it('should have trials when user tries a new challenge', function(done) {
            var trial;
            arenaTrial.trials.length.should.equal(0);
            Promise.fulfilled()
                .then(function() {
                    return Trial.create({
                        challenge: challenge._id,
                        arenaTrial: arenaTrial._id,
                        user: user._id
                    });
                })
                .then(function() {
                    return ArenaTrial.findOne({
                        _id: arenaTrial._id
                    }).exec();
                })
                .then(function(model) {
                    arenaTrial = model;
                    arenaTrial.trials.length.should.equal(1);
                    done();
                }).catch(done);
        });
        it('should gain exp when trial is complete', function(done) {
            var trial;
            arenaTrial.trials.length.should.equal(0);
            observer.once('arenaTrial.trial.awarded', function (arenaTrial) {
                arenaTrial.exp.should.equal(trial.exp);
                done();
            });
            Promise.fulfilled()
                .then(function() {
                    return Trial.create({
                        challenge: challenge._id,
                        arenaTrial: arenaTrial._id,
                        user: user._id,
                        complete: true
                    }).then(function (tr) {
                        trial = tr;
                    });
                }).catch(done);
        });

        it('should become complete when all challange trials are complete', function(done) {
            arenaTrial.trials.length.should.equal(0);
            observer.once('arenaTrial.complete', function (arenaTrial) {
                arenaTrial.complete.should.be.true;
                done();
            });
            Promise.fulfilled()
                .then(function() {
                    var t1 = Trial.create({
                        challenge: challenge._id,
                        arenaTrial: arenaTrial._id,
                        user: user._id,
                        complete: true
                    });
                    var t2 = Trial.create({
                        challenge: challenge2._id,
                        arenaTrial: arenaTrial._id,
                        user: user._id,
                        complete: true
                    });
                    return [t1,t2];
                }).catch(done);
        });
       
    });

    describe("API", function() {
        var url = 'http://localhost:3000';
        var api = url + '/api';
        var user = {
            username: "amr",
            email: "amr.m.draz@gmail.com",
            password: "drazdraz",
            passwordConfirmation: "drazdraz"
        };
        var accessToken;
        var arena = {
            arena: {
                name: 'Basic Arena',
                description: 'An arean for some challenges that are basic'
            }
        };
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
        var arenaTrial = {
            arenaTrial: {
                code: challenge.setup,
                complete: false,
                tests: {},
                challenge: null,
                user: null
            }
        };


        before(function(done) {
            return request(url)
                .post("/signup")
                .send(user)
                .expect(200)
                .then(function(res) {
                    expect(res.status).to.equal(200);
                    return request(url)
                        .post("/token")
                        .send(user);
                })
                .then(function(res) {
                    expect(res.status).to.equal(200);
                    accessToken = res.body.access_token;
                    return request(api)
                        .post("/arenas")
                        .set('Authorization', 'Bearer ' + accessToken)
                        .send(arena);
                }).then(function(res) {
                    res.status.should.equal(200);
                    arena.id = res.body.arena._id;
                    arenaTrial.arenaTrial.arena = arena.id;
                    done();
                }).catch(done);
        });

        after(setup.clearDB);

        describe("POST", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .post("/arenaTrials")
                    .send(arenaTrial)
                    .expect(401)
                    .end(done);
            });

            it("should create a arenaTrial", function(done) {
                return request(api)
                    .post("/arenaTrials")
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send(arenaTrial)
                    .then(function(res) {
                        res.status.should.equal(200);
                        expect(res.body.arenaTrial).to.exist;
                        res.body.arenaTrial.trials.length.should.equal(res.body.trials.length);
                        arenaTrial.id = res.body.arenaTrial._id;
                        done();
                    });
            });
        });

        describe("GET", function() {

            it("should return a arenaTrial by id", function(done) {
                request(api)
                    .get("/arenaTrials/" + arenaTrial.id)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.arenaTrial._id.should.exist;
                        done();
                    });
            });

            it("should return a list of all arenaTrials", function(done) {
                request(api)
                    .get("/arenaTrials")
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.arenaTrial.length.should.equal(1);
                        done();
                    });
            });

        });

        describe("PUT", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .put("/arenaTrials/" + arenaTrial.id)
                    .send(arenaTrial)
                    .expect(401)
                    .end(done);
            });

            it("should update a arenaTrial without user", function(done) {
                request(api)
                    .put("/arenaTrials/" + arenaTrial.id)
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send({
                        arenaTrial: {
                            complete: true
                        }
                    })
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.arenaTrial.complete.should.be.true;
                        arenaTrial.complete = res.body.arenaTrial.complete;
                        done();
                    });
            });
        });

        describe("DELETE", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .del("/arenaTrials/" + arenaTrial.id)
                    .expect(401)
                    .end(done);
            });

            it("should delete a arenaTrial without user", function(done) {
                request(api)
                    .del("/arenaTrials/" + arenaTrial.id)
                    .set('Authorization', 'Bearer ' + accessToken)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        ArenaTrial.findById(arenaTrial.id, function(err, model) {
                            expect(model).to.not.exist;
                            done();
                        });
                    });
            });
        });

    });
    //*/
});
