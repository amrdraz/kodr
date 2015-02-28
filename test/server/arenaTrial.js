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
var observer = require('../../back/observer');



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
                        password: 'testmodel12'
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
            observer.once('arenaTrial.trial.awarded', function(arenaTrial) {
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
                    }).then(function(tr) {
                        trial = tr;
                    });
                }).catch(done);
        });
        it('should become complete when all challange trials are complete', function(done) {
            arenaTrial.trials.length.should.equal(0);
            observer.once('arenaTrial.complete', function(arenaTrial) {
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
                    return [t1, t2];
                }).catch(done);
        });

        it('should find or create arenaTrial with trials for user given arena and user', function(done) {
            Promise.fulfilled().then(function() {
                var at = {
                    arena: arena._id,
                    user: user._id
                };
                return ArenaTrial.findOrCreate(at);
            }).spread(function(at, trials) {
                at._id.should.eql(arenaTrial._id);
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
                arenaTrial.arenaTrial.arena = arena.id;
            }).finally(done);
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
                    .set('Authorization', 'Bearer ' + accessToken)
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
                    .set('Authorization', 'Bearer ' + accessToken)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.arenaTrial.length.should.equal(1);
                        done();
                    });
            });

            it("should return an arenaTrial by arena_id", function(done) {
                request(api)
                    .get("/arenaTrials")
                    .set('Authorization', 'Bearer ' + accessToken)
                    .query({
                        arena: arena.id
                    })
                    .end(function(err, res) {
                        if (err) return done(err);
                        // console.log(res.text);
                        res.status.should.equal(200);
                        expect(res.body.arenaTrial._id).to.exist;
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

            it("should not update someone elses arenaTrial", function(done) {
                request(api)
                    .put("/arenaTrials/" + arenaTrial.id)
                    .set('Authorization', 'Bearer ' + student.token)
                    .send({
                        arenaTrial: {
                            complete: true
                        }
                    })
                    .expect(401)
                    .end(done);
            });

            it("should update own arenaTrial if you're a student", function(done) {
                ArenaTrial.create({
                    user: student._id,
                    arena: arena.id,
                }).then(function(tr) {
                    request(api)
                        .put("/arenaTrials/" + tr.id)
                        .set('Authorization', 'Bearer ' + student.token)
                        .send({
                            arenaTrial: {
                                complete: true
                            }
                        })
                        .expect(200)
                        .end(done);
                });
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

            it("should not delete someone elses arenaTrial if you're a student", function(done) {
                request(api)
                    .del("/arenaTrials/" + arenaTrial.id)
                    .set('Authorization', 'Bearer ' + student.token)
                    .send()
                    .expect(401)
                    .end(done);
            });

            it("should delete own arenaTrial if you're a student", function(done) {
                ArenaTrial.create({
                    user: student._id,
                    arena: arena.id,
                }).then(function(tr) {
                    request(api)
                        .del("/arenaTrials/" + tr.id)
                        .set('Authorization', 'Bearer ' + student.token)
                        .send()
                        .expect(200)
                        .end(done);
                });
            });

            it("should delete a arenaTrial if teacher regardless of ownership", function(done) {
                ArenaTrial.create({
                    user: student._id,
                    arena: arena.id,
                }).then(function(arenaTrial) {
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

            it("should return 404 if already deleted", function(done) {
                ArenaTrial.findByIdAndRemove(arenaTrial.id).exec().then(function() {
                    request(api)
                        .del("/arenaTrials/" + arenaTrial.id)
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
