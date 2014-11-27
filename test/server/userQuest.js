/*globals before,after,beforeEach,afterEach,describe,it */
var Promise = require('bluebird');
var should = require('chai').should();
var expect = require('chai').expect;
var request = require('supertest');
var setup = require('./setup');
var Quest = require('../../back/models/quest');
var Requirement = require('../../back/models/requirement');
var UserQuest = require('../../back/models/userQuest');
var Challenge = require('../../back/models/challenge');
var Trial = require('../../back/models/trial');
var Arena = require('../../back/models/arena');
var User = require('../../back/models/user');
var observer = require('../../back/observer');


/**
 * Test for Quest
 *
 * API
 *
 * GET      userQuests                  return a list of userQuests
 * GET      userQuests/:id              return a userQuest with it's challenges
 * POST     userQuests/:id              create a userQuest given name and description
 * PUT      userQuests/:id              updates name or description of userQuest
 * put      userQuests/user/:id    add a user to the arena
 * DELETE   userQuests/:id              delete userQuest by id
 * delete   userQuests/user/:id    removes a user from this arena
 *
 */

describe('UserQuest', function() {
    before(function(done) {
        return setup.clearDB(done);
    });

    describe('Unit', function() {
        var student,
            student2,
            teacher,
            userQuest, challenge, challenge2;
        beforeEach(function(done) {
            student = {
                username: 'student',
                email: 'student@place.com',
                password: 'student123',
                role: 'student',
                activated: true
            };
            student2 = {
                username: 'student2',
                email: 'student2@place.com',
                password: 'student123',
                role: 'student',
                activated: true
            };
            teacher = {
                username: 'teacher',
                email: 'teach@place.com',
                password: 'teacher123',
                role: 'teacher',
                activated: true
            };
            Promise.fulfilled().then(function() {
                return [
                    User.create(teacher),
                    User.create(student),
                    User.create(student2)
                ];
            }).spread(function(t, st, st2) {
                student = st;
                student2 = st2;
                var at = UserQuest.create({
                    name: "start of a journey",
                    description: "you got 10 exp points",
                    user:student.id
                });
                return [at];
            }).spread(function(g) {
                userQuest = g;
                expect(userQuest).to.exist;
                // console.log(userQuest);
                return [User.findOne({
                    _id: teacher.id
                }).exec(), User.findOne({
                    _id: student.id
                }).exec()];
            }).spread(function(t, st) {
                student = st;
                teacher = t;
            }).finally(done);
        });
        afterEach(setup.clearDB);

        it('should set requirments', function(done) {
            userQuest.requirements.length.should.equal(0);
            var ch = new Challenge();
            var arena = new Arena();
            userQuest.setRequirements([{
                model1: 'Challenge',
                id1: ch.id,
                model2: 'Arena',
                id2: undefined,
            }, {
                model1: 'Challenge',
                id1: undefined,
                times: 2,
                model2: 'Arena',
                id2: arena.id,
            }]).then(function(uq) {
                uq.requirements.length.should.equal(2);
            }).finally(done);
        });

        it('should not set same requirments again', function(done) {
            userQuest.requirements.length.should.equal(0);
            var ch = new Challenge();
            var arena = new Arena();
            var reqs = [{
                model1: 'Challenge',
                id1: ch.id,
                model2: 'Arena',
                id2: undefined,
            }, {
                model1: 'Challenge',
                id1: undefined,
                times: 2,
                model2: 'Arena',
                id2: arena.id,
            }];
            userQuest.setRequirements(reqs).then(function(uq) {
                return uq.setRequirements(reqs);
            }).then(function(uq) {
                uq.requirements.length.should.equal(2);
            }).finally(done);
        });
        it('should create new requirments if repeat time is higher adding the already completed number of times', function(done) {
            userQuest.requirements.length.should.equal(0);
            var ch = new Challenge();
            new Requirement({
                model1: 'Challenge',
                id1: ch.id,
                model2: 'Arena',
                id2: undefined,
                times: 2,
                completed: 1,
                user:userQuest.user,
                userQuests: [userQuest.id]
            }).save(function(err, req) {
                if (err) return done(err);
                userQuest.setRequirements([{
                    model1: 'Challenge',
                    id1: ch.id,
                    model2: 'Arena',
                    id2: undefined,
                    times: 3,
                }]).then(function(uq) {
                    uq.requirements.length.should.equal(2);
                    return Requirement.findOne({times:3}).exec();
                }).then(function (req) {
                    req.completed.should.equal(1);
                }).finally(done);
            });
        });
        it('should create new requirments if repeat time is lower and it should be marked as complete', function(done) {
            userQuest.requirements.length.should.equal(0);
            var ch = new Challenge();
            new Requirement({
                model1: 'Challenge',
                id1: ch.id,
                model2: 'Arena',
                id2: undefined,
                times: 3,
                completed: 2,
                user:userQuest.user,
                userQuests: [userQuest.id]
            }).save(function(err, req) {
                if (err) return done(err);
                userQuest.setRequirements([{
                    model1: 'Challenge',
                    id1: ch.id,
                    model2: 'Arena',
                    id2: undefined,
                    times: 2,
                }]).then(function(uq) {
                    uq.requirements.length.should.equal(2);
                    return Requirement.findOne({times:2}).exec();
                }).then(function (req) {
                    req.completed.should.equal(2);
                    req.complete.should.be.true;
                }).finally(done);
            });
        });
    });
    //*

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
            student2 = {
                username: 'student2',
                email: 'student2@place.com',
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
            };
        var accessToken;
        var userQuest = {
            userQuest: {
                name: 'lab 1',
                rp: 10
            }
        };

        before(function(done) {
            Promise.fulfilled().then(function() {
                return [
                    User.create(teacher),
                    User.create(student),
                    User.create(student2),
                    Quest.create(userQuest.userQuest)
                ];
            }).spread(function(t, st, st2, q) {
                userQuest.userQuest.userQuest = q.id;
                userQuest.userQuest.user = st.id;
                // console.log(st,t,a);
                st.password = student.password;
                student = st;
                st2.password = student2.password;
                student2 = st2;
                t.password = teacher.password;
                teacher = t;

            }).finally(done);
        });

        after(setup.clearDB);

        describe("POST", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .post("/userQuests")
                    .send(userQuest)
                    .expect(401)
                    .end(done);
            });

            it("should not create a userQuest if student", function(done) {
                request(api)
                    .post("/userQuests")
                    .set('Authorization', 'Bearer ' + student.token)
                    .send(userQuest)
                    .expect(401)
                    .end(done);
            });

            it("should create a userQuest if teacher", function(done) {
                request(api)
                    .post("/userQuests")
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .send(userQuest)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        expect(res.body.userQuest._id).to.exist;
                        expect(res.body.userQuest.name).to.exist;
                        userQuest.id = res.body.userQuest._id;
                        userQuest.userQuest = userQuest;
                        done();
                    });
            });
        });

        describe("GET", function() {

            it("should get userQuest not work without accessToken", function(done) {
                request(api)
                    .get("/userQuests/" + userQuest.id)
                    .send()
                    .expect(401)
                    .end(done);
            });

            it("should return a userQuest", function(done) {
                request(api)
                    .get("/userQuests/" + userQuest.id)
                    .set('Authorization', 'Bearer ' + student.token)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.userQuest._id.should.exist;
                        done();
                    });
            });

            it("should get userQuests not work without accessToken", function(done) {
                request(api)
                    .get("/userQuests/")
                    .send()
                    .expect(401)
                    .end(done);
            });

            it("should return a list of all userQuests on if teacher", function(done) {
                request(api)
                    .get("/userQuests")
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.userQuest.length.should.equal(1);
                        done();
                    });
            });

        });

        describe("PUT", function() {

            it("should not work without accessToken", function(done) {
                var update = {
                    userQuest: {
                        name: "new name"
                    }
                };
                request(api)
                    .put("/userQuests/" + userQuest.id)
                    .send(update)
                    .expect(401)
                    .end(done);
            });

            it("should not update a userQuest if student", function(done) {
                var update = {
                    userQuest: {
                        name: "new name"
                    }
                };
                request(api)
                    .put("/userQuests/" + userQuest.id)
                    .set('Authorization', 'Bearer ' + student.token)
                    .send(update)
                    .expect(401)
                    .end(done);
            });

            it("should update a userQuest if teacher", function(done) {
                var update = {
                    userQuest: {
                        name: "new name"
                    }
                };
                request(api)
                    .put("/userQuests/" + userQuest.id)
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .send(update)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.userQuest.name.should.equal(update.userQuest.name);
                        done();
                    });
            });

        });

        describe("DELETE", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .del("/userQuests/" + userQuest.id)
                    .expect(401)
                    .end(done);
            });

            it("should not delete a userQuest if student", function(done) {
                request(api)
                    .del("/userQuests/" + userQuest.id)
                    .set('Authorization', 'Bearer ' + student.token)
                    .expect(401)
                    .end(done);
            });

            it("should delete a userQuest if teacher", function(done) {
                request(api)
                    .del("/userQuests/" + userQuest.id)
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .expect(200)
                    .end(done);
            });

            it("should not delete throw an error if userQuest already deleted", function(done) {
                request(api)
                    .del("/userQuests/" + userQuest.id)
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .expect(404)
                    .end(done);
            });
        });

    });
});
//*/
