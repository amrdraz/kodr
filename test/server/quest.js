/*globals before,after,beforeEach,afterEach,describe,it */
var Promise = require('bluebird');
var should = require('chai').should();
var expect = require('chai').expect;
var request = require('supertest');
var setup = require('./setup');
var Quest = require('../../back/models/quest');
var UserQuest = require('../../back/models/userQuest');
var Challenge = require('../../back/models/challenge');
var Trial = require('../../back/models/trial');
var Arena = require('../../back/models/arena');
var User = require('../../back/models/user');
var observer = require('../../back/mediator');


/**
 * Test for Quest
 *
 * API
 *
 * GET      quests                  return a list of quests
 * GET      quests/:id              return a quest with it's challenges
 * POST     quests/:id              create a quest given name and description
 * PUT      quests/:id              updates name or description of quest
 * put      quests/user/:id    add a user to the arena
 * DELETE   quests/:id              delete quest by id
 * delete   quests/user/:id    removes a user from this arena
 *
 */

describe('Quest', function() {
    before(function(done) {
        return setup.clearDB(done);
    });

    describe('Unit', function() {
        var student,
            student2,
            teacher,
            quest, challenge, challenge2;
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
                    User.create(student2),
                    Challenge.create({exp:20}),
                ];
            }).spread(function(t, st, st2,ch) {
                student = st;
                student2 = st2;
                challenge = ch;
                var at = Quest.create({
                    name: "start of a journey",
                    description: "you got 10 exp points",
                    requirements: [{
                        model1: 'Challenge',
                        model2: 'Arena',
                        times: 1,
                    }],
                    author: teacher.id
                });
                return [at];
            }).spread(function(g) {
                quest = g;
                expect(quest).to.exist;
                // console.log(quest);
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

        it('should check requirments and fail', function(done) {
            quest.requirements.length.should.equal(1);
            quest.check(student).then(function (value) {
                value.should.be.false;
                done();
            });
        });

        it('should check requirments and pass', function(done) {
            quest.requirements.length.should.equal(1);
            Trial.create({challenge:challenge.id,user:student.id, complete:true},function (err, model) {
                if (err) return done(err);
                quest.check(student).then(function (value) {
                    value.should.be.true;
                    done();
                });
            });
        });

        it('should assign user to quest', function(done) {
            student.userQuests.length.should.equal(0);
            quest.assignOrUpdate(student).then(function(userquest) {
                userquest.user.should.eql(student._id);
                return [Quest.findOne({
                    _id: quest.id
                }).exec(),User.findOne({
                    _id: student.id
                }).exec()];
            }).spread(function(quest,user) {
                user.userQuests.length.should.equal(1);
                quest.userQuests.length.should.equal(1);
            }).finally(done);
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
        var quest = {
            quest: {
                name: 'lab 1',
                rp: 10,
                requirements: [{
                    model1: 'Challenge',
                    model2: 'Arena',
                    times: 1,
                }]
            }
        };

        before(function(done) {
            Promise.fulfilled().then(function() {
                return [
                    User.create(teacher),
                    User.create(student),
                    User.create(student2)
                ];
            }).spread(function(t, st, st2) {
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
                    .post("/quests")
                    .send(quest)
                    .expect(401)
                    .end(done);
            });

            it("should not create a quest if student", function(done) {
                request(api)
                    .post("/quests")
                    .set('Authorization', 'Bearer ' + student.token)
                    .send(quest)
                    .expect(401)
                    .end(done);
            });

            it("should create a quest if teacher", function(done) {
                request(api)
                    .post("/quests")
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .send(quest)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        expect(res.body.quest._id).to.exist;
                        expect(res.body.quest.name).to.exist;
                        quest.id = res.body.quest._id;
                        quest.quest = quest;
                        done();
                    });
            });
        });

        describe("GET", function() {

            it("should get quest not work without accessToken", function(done) {
                request(api)
                    .get("/quests/" + quest.id)
                    .send()
                    .expect(401)
                    .end(done);
            });

            it("should return a quest by id without its users if student", function(done) {
                request(api)
                    .get("/quests/" + quest.id)
                    .set('Authorization', 'Bearer ' + student.token)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.quest._id.should.exist;
                        expect(res.body.users).to.not.exist;
                        done();
                    });
            });

            it("should return a quest by id with its users only if teacher", function(done) {
                request(api)
                    .get("/quests/" + quest.id)
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.quest._id.should.exist;
                        res.body.users.length.should.equal(0);
                        res.body.userQuests.length.should.equal(0);
                        done();
                    });
            });

            it("should get quests not work without accessToken", function(done) {
                request(api)
                    .get("/quests/")
                    .send()
                    .expect(401)
                    .end(done);
            });

            it("should return a list of all quests on if teacher", function(done) {
                request(api)
                    .get("/quests")
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.quest.length.should.equal(1);
                        done();
                    });
            });

            it("should return a list of all users that can be assigned to a quest", function(done) {
                request(api)
                    .get("/quests/"+quest.id+"/unassignedUsersOptions")
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.length.should.equal(2); //2 students I created
                        done();
                    });
            });

        });

        describe("PUT", function() {

            it("should not work without accessToken", function(done) {
                var update = {
                    quest: {
                        name: "new name"
                    }
                };
                request(api)
                    .put("/quests/" + quest.id)
                    .send(update)
                    .expect(401)
                    .end(done);
            });

            it("should not update a quest if student", function(done) {
                var update = {
                    quest: {
                        name: "new name"
                    }
                };
                request(api)
                    .put("/quests/" + quest.id)
                    .set('Authorization', 'Bearer ' + student.token)
                    .send(update)
                    .expect(401)
                    .end(done);
            });

            it("should update a quest if teacher", function(done) {
                var update = {
                    quest: {
                        name: "new name"
                    }
                };
                request(api)
                    .put("/quests/" + quest.id)
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .send(update)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.quest.name.should.equal(update.quest.name);
                        done();
                    });
            });

            it("should assign student a quest if teacher", function(done) {
                var update = {
                    users: [student.id],
                    groups:[]
                };
                request(api)
                    .put("/quests/" + quest.id+ "/assign")
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .send(update)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.userQuest.length.should.equal(1);
                        done();
                    });
            });
        });

        describe("DELETE", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .del("/quests/" + quest.id)
                    .expect(401)
                    .end(done);
            });

            it("should not delete a quest if student", function(done) {
                request(api)
                    .del("/quests/" + quest.id)
                    .set('Authorization', 'Bearer ' + student.token)
                    .expect(401)
                    .end(done);
            });

            it("should delete a quest if teacher", function(done) {
                request(api)
                    .del("/quests/" + quest.id)
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .expect(200)
                    .end(done);
            });

            it("should not delete throw an error if quest already deleted", function(done) {
                request(api)
                    .del("/quests/" + quest.id)
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .expect(404)
                    .end(done);
            });
        });

    });
});
//*/
