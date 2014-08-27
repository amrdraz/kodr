/*globals before,after,beforeEach,afterEach,describe,it */
var Promise = require('bluebird');
var should = require('chai').should();
var assert = require('chai').assert;
var expect = require('chai').expect;
var request = require('supertest');
var setup = require('./setup');
var Arena = require('../../back/models/arena');
var Challenge = require('../../back/models/challenge');
var User = require('../../back/models/user');

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

    describe('Challenges', function() {
        var arena, challenge, challenge2;
        beforeEach(function(done) {
            Arena.create({}, function(err, model) {
                arena = model;
                Promise.fulfilled().then(function() {
                    return [
                        Challenge.create({}),
                        Challenge.create({
                            arena: arena._id
                        })
                    ];
                }).spread(function(ch, ch2) {
                    challenge = ch;
                    challenge2 = ch2;
                    Arena.findById(arena._id, function(err, model) {
                        if (err) return done(err);
                        arena = model;
                        done();
                    });
                }).catch(done);

            });
        });
        afterEach(setup.clearDB);
        it('should equal 2 after adding a challenge', function(done) {
            arena.challenges.length.should.equal(1);
            challenge.set({
                arena: arena._id
            });
            challenge.save(function(err) {
                if (err) return done(err);
                Arena.findById(arena.id, function(err, model) {
                    if (err) return done(err);
                    model.challenges.length.should.equal(2);
                    done();
                });
            });
        });
        it('should equal 0 after removing a challenge', function(done) {
            arena.challenges.length.should.equal(1);
            challenge2.remove(function(err) {
                if (err) return done(err);
                Arena.findById(arena.id, function(err, model) {
                    if (err) return done(err);
                    model.challenges.length.should.equal(0);
                    done();
                });
            });
        });

    });

    describe("API", function() {
        var url = setup.url;
        var api = setup.api;
        var user = {
            username: "draz",
            email: "amr.m.draz@gmail.com",
            password: "drazdraz12",
            passwordConfirmation: "drazdraz12"
        };
        var student = {
                username: 'student',
                email: 'student@place.com',
                password: 'student123',
                role: 'student',
                activated: true
            },
            teacher = {
                username: 'teacher',
                email: 'teach@place.com',
                password: 'teacher123',
                role: 'teacher',
                activated: true
            },
            admin = {
                username: 'admin',
                email: 'admin@place.com',
                password: 'admin12345',
                role: 'admin',
                activated: true
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
            Promise.fulfilled().then(function() {
                return [
                    Challenge.create(challenge.challenge),
                    User.create(student),
                    User.create(teacher),
                    User.create(admin)
                ];
            }).spread(function(ch, st, t, a) {
                // console.log(st,t,a);
                student._id = st._id;
                student.token = st.token;
                admin._id = a._id;
                admin.token = a.token;
                teacher._id = t._id;
                teacher.token = t.token;
                challenge.challenge = ch;
            }).finally(done);
        });

        describe("POST", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .post("/arenas")
                    .send(arena)
                    .expect(401)
                    .end(done);
            });

            it("should not create an arean if student", function(done) {
                request(api)
                    .post("/arenas")
                    .set('Authorization', 'Bearer ' + student.token)
                    .send(arena)
                    .expect(401)
                    .end(done);
            });

            it("should create an arean if teacher", function(done) {
                request(api)
                    .post("/arenas")
                    .set('Authorization', 'Bearer ' + teacher.token)
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

            it("should return an arena by id with it's challenges", function(done) {
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

            it("should not update an arena if student", function(done) {
                var update = {
                    arena: {
                        name: "new name"
                    }
                };
                request(api)
                    .put("/arenas/" + arena.id)
                    .set('Authorization', 'Bearer ' + student.token)
                    .send(update)
                    .expect(401)
                    .end(done);
            });

            it("should update an arena if teacher", function(done) {
                var update = {
                    arena: {
                        name: "new name"
                    }
                };
                request(api)
                    .put("/arenas/" + arena.id)
                    .set('Authorization', 'Bearer ' + teacher.token)
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

            it("should delete an arena if student", function(done) {
                request(api)
                    .del("/arenas/" + arena.id)
                    .set('Authorization', 'Bearer ' + student.token)
                    .expect(401)
                    .end(done);
            });

            it("should delete an arena if teacher", function(done) {
                request(api)
                    .del("/arenas/" + arena.id)
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        Arena.findById(arena.id, function(err, model) {
                            expect(model).to.not.exist;
                            done();
                        });
                    });
            });

            it("should not delete throw an error if arena already deleted", function(done) {
                request(api)
                    .del("/arenas/" + arena.id)
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .expect(404)
                    .end(done);
            });
        });

    });
    //*/
});
