/*globals before,after,beforeEach,afterEach,describe,it */
var Async = require('async');
var should = require('chai').should();
var assert = require('chai').assert;
var expect = require('chai').expect;
var request = require('supertest');
var setup = require('./setup');
var Arena = require('../../back/models/arena');
var Challenge = require('../../back/models/challenge');

/**
 * Test for Arean
 *
 * API
 *
 * GET      areans                  return a list of areans
 * GET      arenas/:id              return an arean with it's challenges
 * POST     arenas/:id              create an arean given name and description
 * PUT      areans/:id              updates name or description of arena
 * put      areans/challenge/:id    add a challenge to the arena
 * DELETE   arenas/:id              delete arean by id
 * delete   arenas/challenge/:id    removes a challenge from this arena
 *
 */

describe('Arena', function() {
    before(function(done) {
        return setup.clearDB(done);
    });

    describe('Integration', function() {
        var arena;
        before(setup.challengeTest);
        beforeEach(function(done) {
            Arena.create({
                name: "test arena"
            }, function(err, model) {
                arena = model;
                done();
            });
        });
        afterEach(function(done) {
            arena.remove(done);
        });
        after(setup.clearDB);

        describe('Relationships', function() {
            var challenges = [];
            before(function(done) {
                Challenge.find({}, function(err, models) {
                    if (err) return done(err);
                    challenges = models;
                    done();
                });
            });
            it('should add challenge in challenges', function(done) {
                arena.challenges.length.should.equal(0);
                challenges[0].set({
                    arena: arena._id
                });
                challenges[0].save(function(err) {
                    if (err) return done(err);
                    Arena.findById(arena.id, function(err, model) {
                        if (err) return done(err);
                        arena = model;
                        arena.challenges.length.should.equal(1);
                        done();
                    });
                });
            });
            it('should still be able to populate', function(done) {
                arena.challenges.length.should.equal(0);
                challenges[0].set({
                    arena: arena._id
                });
                challenges[0].save(function(err) {
                    if (err) return done(err);
                    Async.parallel([
                        function(cb) {
                            Arena.findById(arena.id, function(err, model) {
                                if(err) return cb(err);
                                model.challenges.length.should.equal(1);
                                model.challenges[0].should.not.be.an.instanceOf(Challenge);
                                expect(model.challenges[0].name).to.not.exist;
                                cb(null, model);
                            });
                        },
                        function (cb) {
                            Arena.findById(arena._id).populate('challenges').exec(function(err, model) {
                                model.challenges[0].should.be.an.instanceOf(Challenge);
                                model.challenges[0].name.should.exist;
                                cb(null, model);
                            });
                        }
                    ],
                    done);
                    
                });

            });
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
                preCode: "",
                postCode: "",
                description: "create a variable and assign to it the value 20",
                exp: 2,
                isPublished: true
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
                            done();
                        });
                });
        });

        describe("POST", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .post("/arenas")
                    .send(arena)
                    .expect(401)
                    .end(done);
            });

            it("should create an arean", function(done) {
                request(api)
                    .post("/arenas")
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send(arena)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.arena._id.should.exist;
                        res.body.arena.name.should.equal(arena.arena.name);
                        res.body.arena.description.should.equal(arena.arena.description);
                        res.body.arena.author.should.exist;
                        arena.id = res.body.arena._id;
                        done();
                    });
            });
        });

        describe("GET", function() {

            it("should return a arena by id with it's challenges", function(done) {
                request(api)
                    .get("/arenas/" + arena.id)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.arena._id.should.exist;
                        res.body.challenges.length.should.equal(0);
                        done();
                    });
            });

            it("should return a list of all arenas", function(done) {
                request(api)
                    .get("/arenas")
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.arena.length.should.equal(1);
                        done();
                    });
            });

        });

        describe("PUT", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .put("/arenas/" + arena.id)
                    .send(arena)
                    .expect(401)
                    .end(done);
            });

            it("should update a arena", function(done) {
                var update = {
                    arena: {
                        name: "new name"
                    }
                };
                request(api)
                    .put("/arenas/" + arena.id)
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send(update)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.arena.name.should.equal(update.arena.name);
                        done();
                    });
            });
        });

        describe("DELETE", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .del("/arenas/" + arena.id)
                    .expect(401)
                    .end(done);
            });

            it("should delete a arena", function(done) {
                request(api)
                    .del("/arenas/" + arena.id)
                    .set('Authorization', 'Bearer ' + accessToken)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        Arena.findById(arena.id, function(err, model) {
                            expect(model).to.not.exist;
                            done();
                        });
                    });
            });
        });

    });
    //*/
});
