/*globals before,after,beforeEach,afterEach,describe,it */
var Promise = require('bluebird');
var _ = require('lodash');
var should = require('chai').should();
var expect = require('chai').expect;
var request = require('supertest');
var setup = require('./setup');

var Group = require('../../back/models/group');
var Challenge = require('../../back/models/challenge');
var Trial = require('../../back/models/trial');
var User = require('../../back/models/user');
var observer = require('../../back/observer');


/**
 * Test for Group
 *
 * API
 *
 * GET      groups                  return a list of groups
 * GET      groups/:id              return a group with it's challenges
 * POST     groups/                 create a group given name and description
 * POST     groups/:id/join         Addes a Member to the Group
 * PUT      groups/:id              updates name or description of group
 * PUT      groups/:id/activate     Addes a Member to the Group
 * PUT      groups/:id/leave        Removes a user from this Group
 * DELETE   groups/:id              Delete group by id
 * DELETE   groups/:id/remove       Removes a user from this Group
 *
 */

describe('Group', function() {
    before(function(done) {
        return setup.clearDB(done);
    });

    describe('Unit', function () {
        var group;
        before(function () {
            group = new Group();
        });
        it('should have name', function () {
            should.exist(group.name);
        });
        it('should have members list', function () {
            should.exist(group.members);
            group.members.length.should.equal(0);
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
            },
            admin = {
                username: 'admin',
                email: 'admin@place.com',
                password: 'teacher123',
                role: 'admin',
                activated: true
            };
        var accessToken;
        var group = {
            group: {}
        },group2;

        before(function(done) {
            Promise.fulfilled().then(function() {
                return [
                    User.create(admin),
                    User.create(teacher),
                    User.create(student),
                    User.create(student2)
                ];
            }).spread(function(a,t, st, st2) {
                // console.log(st,t,a);
                a.password = admin.password;
                admin = a;
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

            it("should not create a group if teacher", function(done) {
                request(api)
                    .post("/groups")
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .send(group)
                    .expect(401)
                    .end(done);
            });

            it("should create a group if admin", function(done) {
                request(api)
                    .post("/groups")
                    .set('Authorization', 'Bearer ' + admin.token)
                    .send(group)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        should.exist(res.body.group._id);
                        should.exist(res.body.group.name);
                        group.id = res.body.group._id;
                        group.group = group;
                        done();
                    });
            });


            it("should create many groups if admin", function(done) {
                request(api)
                    .post("/groups/many")
                    .set('Authorization', 'Bearer ' + admin.token)
                    .send({
                        name:'E',
                        from:1,
                        to:5
                    })
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.groups.length.should.equal(5);
                        res.body.groups[0].name.should.equal("E 01");
                        group2 = res.body.groups[0];
                        done();
                    });
            });

            it("should join group if student", function(done) {
                request(api)
                    .post("/groups/"+group.id+"/join/")
                    .set('Authorization', 'Bearer ' + student.token)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        should.exist(res.body.group._id);
                        should.exist(res.body.member);
                        // var memb = _.find(res.body.members, {user:student.id});
                        // res.body.member.isActive.should.equal(false);
                        group.group = group;
                        done();
                    });
            });

            it("should join group if teacher", function(done) {
                request(api)
                    .post("/groups/"+group.id+"/join/")
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        should.exist(res.body.group._id);
                        should.exist(res.body.member);
                        // var memb = _.find(res.body.members, {user:teacher.id});
                        // should.exist(memb);
                        res.body.member.isActive.should.equal(true);
                        group.group = group;
                        done();
                    });
            });

            it("should  add user to group", function(done) {
                request(api)
                    .post("/groups/"+group.id+"/members/"+student2.id)
                    .set('Authorization', 'Bearer ' + admin.token)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        should.exist(res.body.group._id);
                        should.exist(res.body.member);
                        group.group = res.body.group;
                        done();
                    });
            });

            it("should add multiple users to group", function(done) {
                request(api)
                    .post("/groups/"+group2._id+"/members/")
                    .set('Authorization', 'Bearer ' + admin.token)
                    .send({uids:[teacher.id,student.id,student2.id]})
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        should.exist(res.body.group._id);
                        should.exist(res.body.members);
                        res.body.members.length.should.equal(3);
                        group2.members = res.body.members;
                        done();
                    });
            });
        });

        describe("GET", function() {

            it("should not get group without accessToken", function(done) {
                request(api)
                    .get("/groups/" + group.id)
                    .send()
                    .expect(401)
                    .end(done);
            });

            it("should return a group by id with its members if teacher", function(done) {
                request(api)
                    .get("/groups/" + group.id)
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        should.exist(res.body.group._id);
                        should.exist(res.body.members);
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

            it("should return a list of all groups that user is in if teacher", function(done) {
                request(api)
                    .get("/groups")
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.group.length.should.be.gt(0);
                        done();
                    });
            });

            it("should return a list of all groups on if admin", function(done) {
                request(api)
                    .get("/groups")
                    .set('Authorization', 'Bearer ' + admin.token)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.group.length.should.equal(6);
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

            it("should not update a group if teacher is part of group", function(done) {
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

            // it("should request to join group", function(done) {
            //     request(api)
            //         .post("/groups/" + group.id + "/join/"+student._id)
            //         .set('Authorization', 'Bearer ' + student.token)
            //         .end(function(err, res) {
            //             if (err) return done(err);
            //             res.status.should.equal(200);
            //             res.body.group.members.length.should.equal(2);
            //             res.body.users.length.should.equal(2);
            //             done();
            //         });
            // });

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

            it("should remove user from group", function(done) {
                request(api)
                    .delete("/groups/"+group.id+"/members/"+student2.id)
                    .set('Authorization', 'Bearer ' + admin.token)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        should.exist(res.body.group._id);
                        should.exist(res.body.group.members);
                        group.group = res.body.group;
                        done();
                    });
            });

            it("should not delete a group if student", function(done) {
                request(api)
                    .del("/groups/" + group.id)
                    .set('Authorization', 'Bearer ' + student.token)
                    .expect(401)
                    .end(done);
            });

            it("should not delete a group if teacher", function(done) {
                request(api)
                    .del("/groups/" + group.id)
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .expect(401)
                    .end(done);
            });

            it("should not delete a group if teacher", function(done) {
                request(api)
                    .del("/groups/" + group.id)
                    .set('Authorization', 'Bearer ' + admin.token)
                    .expect(204)
                    .end(done);
            });

            it("should not delete and throw an error if group already deleted", function(done) {
                request(api)
                    .del("/groups/" + group.id)
                    .set('Authorization', 'Bearer ' + admin.token)
                    .expect(404)
                    .end(done);
            });
        });

    });
});
//*/
