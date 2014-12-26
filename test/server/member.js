/*globals before,after,beforeEach,afterEach,describe,it */
var Promise = require('bluebird');
var _ = require('lodash');
var should = require('chai').should();
var expect = require('chai').expect;
var request = require('supertest');
var setup = require('./setup');

var Member = require('../../back/models/member');
var Group = require('../../back/models/group');
var User = require('../../back/models/user');
var observer = require('../../back/observer');


/**
 * Test for Member
 *
 * API
 *
 * GET      members                  return a list of members
 * GET      members/:id              return a member with it's challenges
 * POST     members/                 create a member given name and description
 * PUT      members/:id              updates name or description of member
 * DELETE   members/:id              Delete member by id
 *
 */

describe('Member', function() {
    before(function(done) {
        return setup.clearDB(done);
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
            }, group;
        var accessToken;
        var member = {
            member: {}
        },member2;

        before(function(done) {
            Promise.fulfilled().then(function() {
                return [
                    User.create(admin),
                    User.create(teacher),
                    User.create(student),
                    User.create(student2),
                    Group.create({})
                ];
            }).spread(function(a,t, st, st2, g) {
                // console.log(st,t,a);
                a.password = admin.password;
                admin = a;
                st.password = student.password;
                student = st;
                st2.password = student2.password;
                student2 = st2;
                t.password = teacher.password;
                teacher = t;
                group = g;
            }).finally(done);
        });

        after(setup.clearDB);

        describe("POST", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .post("/members")
                    .send(member)
                    .expect(401)
                    .end(done);
            });

            it("should not create a member if student", function(done) {
                request(api)
                    .post("/members")
                    .set('Authorization', 'Bearer ' + student.token)
                    .send(member)
                    .expect(401)
                    .end(done);
            });

            it("should not create a member if teacher", function(done) {
                request(api)
                    .post("/members")
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .send(member)
                    .expect(401)
                    .end(done);
            });

            it("should create a member if admin", function(done) {
                request(api)
                    .post("/members")
                    .set('Authorization', 'Bearer ' + admin.token)
                    .send({member:{group:group.id, user:user.student}})
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        should.exist(res.body.member._id);
                        should.exist(res.body.member.uname);
                        member.id = res.body.member._id;
                        member.member = member;
                        done();
                    });
            });

        });

        describe("GET", function() {

            it("should not get member without accessToken", function(done) {
                request(api)
                    .get("/members/" + member.id)
                    .send()
                    .expect(401)
                    .end(done);
            });

            it("should return a member by id with its members if teacher", function(done) {
                request(api)
                    .get("/members/" + member.id)
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        should.exist(res.body.member._id);
                        done();
                    });
            });

            it("should get members not work without accessToken", function(done) {
                request(api)
                    .get("/members/")
                    .send()
                    .expect(401)
                    .end(done);
            });

            it("should return a list of all members on if admin", function(done) {
                request(api)
                    .get("/members")
                    .set('Authorization', 'Bearer ' + admin.token)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.members.length.should.be.gt(0);
                        done();
                    });
            });

        });

        describe("PUT", function() {

            it("should not work without accessToken", function(done) {
                var update = {
                    member: {
                        name: "new name"
                    }
                };
                request(api)
                    .put("/members/" + member.id)
                    .send(update)
                    .expect(401)
                    .end(done);
            });

            it("should not update a member if student", function(done) {
                var update = {
                    member: {
                        name: "new name"
                    }
                };
                request(api)
                    .put("/members/" + member.id)
                    .set('Authorization', 'Bearer ' + student.token)
                    .send(update)
                    .expect(401)
                    .end(done);
            });

            it("should update a member if teacher is part of member", function(done) {
                var update = {
                    member: {
                        uname: "new name"
                    }
                };
                request(api)
                    .put("/members/" + member.id)
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .send(update)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.member.uname.should.equal(update.member.uname);
                        done();
                    });
            });

        });

        describe("DELETE", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .del("/members/" + member.id)
                    .expect(401)
                    .end(done);
            });

            it("should not delete a member if student", function(done) {
                request(api)
                    .del("/members/" + member.id)
                    .set('Authorization', 'Bearer ' + student.token)
                    .expect(401)
                    .end(done);
            });

            it("should not delete a member if teacher", function(done) {
                request(api)
                    .del("/members/" + member.id)
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .expect(401)
                    .end(done);
            });

            it("should not delete a member if teacher", function(done) {
                request(api)
                    .del("/members/" + member.id)
                    .set('Authorization', 'Bearer ' + admin.token)
                    .expect(204)
                    .end(done);
            });

            it("should not delete and throw an error if member already deleted", function(done) {
                request(api)
                    .del("/members/" + member.id)
                    .set('Authorization', 'Bearer ' + admin.token)
                    .expect(404)
                    .end(done);
            });
        });

    });
});
//*/
