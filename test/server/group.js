/*globals before,after,beforeEach,afterEach,describe,it */
var Promise = require('bluebird');
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
 * POST     groups/:id              create a group given name and description
 * PUT      groups/:id              updates name or description of group
 * put      groups/user/:id    add a user to the arena
 * DELETE   groups/:id              delete group by id
 * delete   groups/user/:id    removes a user from this arena
 *
 */

describe('Group', function() {
    before(function(done) {
        return setup.clearDB(done);
    });

    describe('Integration', function() {
        var student,
            student2,
            teacher,
            group, challenge, challenge2;
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
                st.password = student.password;
                student = st;
                st2.password = student2.password;
                student2 = st2;
                t.password = teacher.password;
                teacher = t;
                var at = Group.create({
                    founder: teacher._id,
                    members: [st._id]
                });
                var ch = Challenge.create({
                    exp: 4,
                });
                var ch2 = Challenge.create({
                    exp: 2,
                });
                return [at, ch, ch2];
            }).spread(function(g, ch1, ch2) {
                challenge = ch1;
                challenge2 = ch2;
                group = g;
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

        it('should add memeber', function(done) {
            group.members.length.should.equal(1);
            group.members = [student._id, student2._id];
            group.save(function(err, group) {
                if (err) return done(err);
                group.members.length.should.equal(2);
                User.find({
                    group: group.id
                }, function(err, users) {
                    if (err) return done(err);
                    users.length.should.equal(2);
                    done();
                });
            });
        });

        // it('should remove memeber', function(done) {
        //     group.members.length.should.equal(1);
        //     expect(student.group).to.exist;
        //     // group.members = [];
        //     student.group = undefined;
        //     student.save(function(err, user) {
        //         if (err) return done(err);
        //         expect(user.group).to.not.exist;
        //         Group.findById(group.id, function(err, g) {
        //             if (err) return done(err);
        //             g.members.length.should.equal(0);
        //             done();
        //         });
        //     });
        //     // group.save(function(err, user) {
        //     //     if (err) return done(err);
        //     //     group.members.length.should.equal(0);
        //     //     User.findById(student._id, function(err, user) {
        //     //         if (err) return done(err);
        //     //         expect(user.group).to.not.exist;
        //     //         done();
        //     //     });
        //     // });
        // });

        it('should update exp when trial is complete', function(done) {

            var times = 0;
            Promise.fulfilled().then(function() {
                return [
                    Trial.create({
                        challenge: challenge.id,
                        user: student.id,
                        complete: true
                    }),
                    Trial.create({
                        challenge: challenge2.id,
                        user: student.id,
                        complete: true
                    })
                ];
            }).spread(function(tr, tr2) {

                observer.on('user.awarded', function(user, type, value) {
                    times++;
                    // console.log('assigned user exp ', user.exp, ' after adding ', value);
                    if (times === 2) {
                        user.exp.should.equal(challenge.exp + challenge2.exp);
                        done();
                    }
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
});
//*/
