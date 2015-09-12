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
var UserArena = require('../../back/models/userArena');
var observer = require('../../back/observer');



describe('UserArena', function() {
    before(function(done) {
        return setup.clearDB(done);
    });

    describe('Integration', function() {
        var arena, userArena, challenge, challenge2, user;
        beforeEach(function(done) {
            Promise.fulfilled()
                .then(function() {
                    var ar = Arena.create({});
                    var usr = User.create({
                        username: 'test',
                        password: 'testmodel12'
                    });
                    return [ar, usr];
                })
                .spread(function(ar, usr) {
                    arena = ar;
                    user = usr;
                    var at = UserArena.create({
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
                    userArena = at;
                    done();
                }).catch(done);

        });
        afterEach(setup.clearDB);
        it('should have trials when user tries a new challenge', function(done) {
            var trial;
            userArena.trials.length.should.equal(0);
            Promise.fulfilled()
                .then(function() {
                    return Trial.create({
                        challenge: challenge._id,
                        userArena: userArena._id,
                        user: user._id
                    });
                })
                .then(function() {
                    return UserArena.findOne({
                        _id: userArena._id
                    }).exec();
                })
                .then(function(model) {
                    userArena = model;
                    userArena.trials.length.should.equal(1);
                    done();
                }).catch(done);
        });
        it('should gain exp when trial is complete', function(done) {
            var trial;
            userArena.trials.length.should.equal(0);
            observer.once('userArena.trial.awarded', function(userArena) {
                userArena.exp.should.equal(trial.exp);
                done();
            });
            Promise.fulfilled()
                .then(function() {
                    return Trial.create({
                        challenge: challenge._id,
                        userArena: userArena._id,
                        user: user._id,
                        complete: true
                    }).then(function(tr) {
                        trial = tr;
                    });
                }).catch(done);
        });
        it('should become complete when all challange trials are complete', function(done) {
            userArena.trials.length.should.equal(0);
            observer.once('userArena.complete', function(userArena) {
                userArena.complete.should.be.true;
                done();
            });
            Promise.fulfilled()
                .then(function() {
                    var t1 = Trial.create({
                        challenge: challenge._id,
                        userArena: userArena._id,
                        user: user._id,
                        complete: true
                    });
                    var t2 = Trial.create({
                        challenge: challenge2._id,
                        userArena: userArena._id,
                        user: user._id,
                        complete: true
                    });
                    return [t1, t2];
                }).catch(done);
        });

        it('should find or create userArena with trials for user given arena and user', function(done) {
            Promise.fulfilled().then(function() {
                var at = {
                    arena: arena._id,
                    user: user._id
                };
                return UserArena.findOrCreateWithTrials(at);
            }).spread(function(at, trials) {
                at._id.should.eql(userArena._id);
                trials.length.should.equal(2);
            }).finally(done);
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
                description: "create a variable and assign to it the value 20",
                exp: 2,
                isPublished: false
            }
        };
        var userArena = {
            userArena: {
                code: challenge.setup,
                complete: false,
                tests: {},
                challenge: null,
                user: null
            }
        };


        before(function(done) {
            Promise.fulfilled().then(function() {
                return [
                    User.create(student),
                    User.create(teacher),
                    User.create(admin),
                    Arena.create(arena.arena),
                ];
            }).spread(function(st, t, a, ar) {
                // console.log(st,t,a);
                student._id = st._id;
                student.token = st.token;
                admin._id = a._id;
                admin.token = a.token;
                teacher._id = t._id;
                accessToken = teacher.token = t.token;
                arena.id = ar.id;
                userArena.userArena.arena = arena.id;
            }).finally(done);
        });

        after(setup.clearDB);

        describe("POST", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .post("/userArenas")
                    .send(userArena)
                    .expect(401)
                    .end(done);
            });

            it("should create a userArena", function(done) {
                return request(api)
                    .post("/userArenas")
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send(userArena)
                    .then(function(res) {
                        res.status.should.equal(200);
                        expect(res.body.userArena).to.exist;
                        res.body.userArena.trials.length.should.equal(res.body.trials.length);
                        userArena.id = res.body.userArena._id;
                        done();
                    });
            });
        });

        describe("GET", function() {

            it("should return a userArena by id", function(done) {
                request(api)
                    .get("/userArenas/" + userArena.id)
                    .set('Authorization', 'Bearer ' + accessToken)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.userArena._id.should.exist;
                        done();
                    });
            });

            it("should return a list of all userArenas", function(done) {
                request(api)
                    .get("/userArenas")
                    .set('Authorization', 'Bearer ' + accessToken)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.userArena.length.should.equal(1);
                        done();
                    });
            });

            it("should return an userArena by arena_id", function(done) {
                request(api)
                    .get("/userArenas")
                    .set('Authorization', 'Bearer ' + accessToken)
                    .query({
                        arena: arena.id
                    })
                    .end(function(err, res) {
                        if (err) return done(err);
                        // console.log(res.text);
                        res.status.should.equal(200);
                        expect(res.body.userArena._id).to.exist;
                        done();
                    });
            });

        });

        describe("PUT", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .put("/userArenas/" + userArena.id)
                    .send(userArena)
                    .expect(401)
                    .end(done);
            });

            it("should not update someone elses userArena", function(done) {
                request(api)
                    .put("/userArenas/" + userArena.id)
                    .set('Authorization', 'Bearer ' + student.token)
                    .send({
                        userArena: {
                            complete: true
                        }
                    })
                    .expect(401)
                    .end(done);
            });

            it("should update own userArena if you're a student", function(done) {
                UserArena.create({
                    user: student._id,
                    arena: arena.id,
                }).then(function(tr) {
                    request(api)
                        .put("/userArenas/" + tr.id)
                        .set('Authorization', 'Bearer ' + student.token)
                        .send({
                            userArena: {
                                complete: true
                            }
                        })
                        .expect(200)
                        .end(done);
                });
            });

            it("should update a userArena without user", function(done) {
                request(api)
                    .put("/userArenas/" + userArena.id)
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send({
                        userArena: {
                            complete: true
                        }
                    })
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.userArena.complete.should.be.true;
                        userArena.complete = res.body.userArena.complete;
                        done();
                    });
            });
        });

        describe("DELETE", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .del("/userArenas/" + userArena.id)
                    .expect(401)
                    .end(done);
            });

            it("should not delete someone elses userArena if you're a student", function(done) {
                request(api)
                    .del("/userArenas/" + userArena.id)
                    .set('Authorization', 'Bearer ' + student.token)
                    .send()
                    .expect(401)
                    .end(done);
            });

            it("should delete own userArena if you're a student", function(done) {
                UserArena.create({
                    user: student._id,
                    arena: arena.id,
                }).then(function(tr) {
                    request(api)
                        .del("/userArenas/" + tr.id)
                        .set('Authorization', 'Bearer ' + student.token)
                        .send()
                        .expect(200)
                        .end(done);
                });
            });

            it("should delete a userArena if teacher regardless of ownership", function(done) {
                UserArena.create({
                    user: student._id,
                    arena: arena.id,
                }).then(function(userArena) {
                    request(api)
                        .del("/userArenas/" + userArena.id)
                        .set('Authorization', 'Bearer ' + accessToken)
                        .end(function(err, res) {
                            if (err) return done(err);
                            res.status.should.equal(200);
                            UserArena.findById(userArena.id, function(err, model) {
                                expect(model).to.not.exist;
                                done();
                            });
                        });
                });
            });

            it("should return 404 if already deleted", function(done) {
                UserArena.findByIdAndRemove(userArena.id).exec().then(function() {
                    request(api)
                        .del("/userArenas/" + userArena.id)
                        .set('Authorization', 'Bearer ' + accessToken)
                        .send()
                        .expect(404)
                        .end(done);
                });

            });
        });

    });
    //*/
});
