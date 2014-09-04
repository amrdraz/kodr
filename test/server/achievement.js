/*globals before,after,beforeEach,afterEach,describe,it */
var Promise = require('bluebird');
var should = require('chai').should();
var expect = require('chai').expect;
var request = require('supertest');
var setup = require('./setup');
var Achievement = require('../../back/models/achievement');
var Challenge = require('../../back/models/challenge');
var Trial = require('../../back/models/trial');
var User = require('../../back/models/user');
var observer = require('../../back/mediator');


/**
 * Test for Achievement
 *
 * API
 *
 * GET      groups                  return a list of groups
 * GET      groups/:id              return a group with it's challenges
 * POST     groups/:id              create a group given name and description
 * PUT      groups/:id              updates name or description of group
 * put      groups/user/:id    add a user to the arena
 * DELETE   groups/:id              delete group by id
 * delete   groups/user/:id    removes a user from this arena
 *
 */

describe('Achievement', function() {
    before(function(done) {
        return setup.clearDB(done);
    });

    describe('Unit', function() {
        var student,
            student2,
            teacher,
            achievement, challenge, challenge2;
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
                var at = Achievement.create({
                    name:"start of a journey",
                    description: "you got 10 exp points",
                    requirements: [{property:'exp', condition:'>=', activation:10}],
                    author: teacher.id
                });
                return [at];
            }).spread(function(g) {
                achievement = g;
                expect(achievement).to.exist;
                // console.log(achievement);
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
            achievement.requirements.length.should.equal(1);
            achievement.check(student).should.be.false;
            done();
        });

         it('should check requirments and pass', function(done) {
            achievement.requirements.length.should.equal(1);
            student.exp = 10;
            achievement.check(student).should.be.true;
            done();
        });


        
    });
/*

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
        var group = {
            group: {}
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
                    .post("/groups")
                    .send(group)
                    .expect(401)
                    .end(done);
            });

            it("should not create a group if student", function(done) {
                request(api)
                    .post("/groups")
                    .set('Authorization', 'Bearer ' + student.token)
                    .send(group)
                    .expect(401)
                    .end(done);
            });

            it("should create a group if teacher", function(done) {
                request(api)
                    .post("/groups")
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .send(group)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        expect(res.body.group._id).to.exist;
                        expect(res.body.group.name).to.exist;
                        res.body.users.length.should.equal(0);
                        res.body.group.founder.should.equal(teacher.id);
                        group.id = res.body.group._id;
                        group.group = group;
                        done();
                    });
            });
        });

        describe("GET", function() {

            it("should get group not work without accessToken", function(done) {
                request(api)
                    .get("/groups/" + group.id)
                    .send()
                    .expect(401)
                    .end(done);
            });

            it("should return a group by id with its users only if teacher", function(done) {
                request(api)
                    .get("/groups/" + group.id)
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.group._id.should.exist;
                        res.body.users.length.should.equal(0);
                        done();
                    });
            });

            it("should get groups not work without accessToken", function(done) {
                request(api)
                    .get("/groups/")
                    .send()
                    .expect(401)
                    .end(done);
            });

            it("should return a list of all groups on if teacher", function(done) {
                request(api)
                    .get("/groups")
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.group.length.should.equal(1);
                        done();
                    });
            });

        });

        describe("PUT", function() {

            it("should not work without accessToken", function(done) {
                var update = {
                    group: {
                        name: "new name"
                    }
                };
                request(api)
                    .put("/groups/" + group.id)
                    .send(update)
                    .expect(401)
                    .end(done);
            });

            it("should not update a group if student", function(done) {
                var update = {
                    group: {
                        name: "new name"
                    }
                };
                request(api)
                    .put("/groups/" + group.id)
                    .set('Authorization', 'Bearer ' + student.token)
                    .send(update)
                    .expect(401)
                    .end(done);
            });

            it("should update a group if teacher", function(done) {
                var update = {
                    group: {
                        name: "new name"
                    }
                };
                request(api)
                    .put("/groups/" + group.id)
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .send(update)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.group.name.should.equal(update.group.name);
                        done();
                    });
            });

            it("should add members", function(done) {
                var update = {
                    group: {
                        members: [student.id, student2.id]
                    }
                };
                request(api)
                    .put("/groups/" + group.id)
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .send(update)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.group.members.length.should.equal(2);
                        res.body.users.length.should.equal(2);
                        done();
                    });
            });

            // it("should remove members", function(done) {
            //     var update = {
            //         group: {
            //             members: []
            //         }
            //     };
            //     request(api)
            //         .put("/groups/" + group.id)
            //         .set('Authorization', 'Bearer ' + teacher.token)
            //         .send(update)
            //         .end(function(err, res) {
            //             if (err) return done(err);
            //             res.status.should.equal(200);
            //             res.body.group.members.length.should.equal(0);
            //             res.body.users.length.should.equal(0);
            //             done();
            //         });
            // });
        });

        describe("DELETE", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .del("/groups/" + group.id)
                    .expect(401)
                    .end(done);
            });

            it("should not delete a group if student", function(done) {
                request(api)
                    .del("/groups/" + group.id)
                    .set('Authorization', 'Bearer ' + student.token)
                    .expect(401)
                    .end(done);
            });

            it("should delete a group if teacher", function(done) {
                request(api)
                    .del("/groups/" + group.id)
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .expect(200)
                    .end(done);
            });

            it("should not delete throw an error if group already deleted", function(done) {
                request(api)
                    .del("/groups/" + group.id)
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .expect(404)
                    .end(done);
            });
        });

    });
*/});
//*/
