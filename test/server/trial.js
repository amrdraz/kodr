/*globals before,beforeEach,after,afterEach,describe,it */
var should = require('chai').should();
var assert = require('chai').assert;
var expect = require('chai').expect;
var request = require('supertest');
var Promise = require('bluebird');
var util = require('util');
var setup = require('./setup');
var Trial = require('../../back/models/trial');
var User = require('../../back/models/user');
var Challenge = require('../../back/models/challenge');
var Arena = require('../../back/models/arena');
var AreanTrial = require('../../back/models/userArena');
var observer = require('../../back/observer');



describe('Trial', function() {
    before(function(done) {
        return setup.clearDB(done);
    });

    after(setup.clearDB);

    describe('Unit', function() {
        after(setup.clearDB);

        it('should create a trial with id', function(done) {
            var arena = new Arena({});
            var user = new User({});
            var areanTrial = new AreanTrial({
                arena: arena.id,
                user: user.id
            });
            var challenge = new Challenge({
                arena: arena.id
            });
            Trial.findOrCreate({
                userArena: areanTrial.id,
                arena: areanTrial.arena,
                user: areanTrial.user,
                challenge: challenge.id,
                code: challenge.setup
            }).then(function(trial) {
                should.exist(trial);
                done();
            });
        });
        it('should create a trial with challenge and user id only', function(done) {

            Promise.fulfilled().then(function() {
                var arena = Arena.create({});
                var user = User.create({
                    username: 'stdr',
                    password: "ssh9hkjkljdd"
                });
                var challenge = arena.then(function(arena) {
                    return Challenge.create({
                        arena: arena.id
                    });
                });
                return [user, arena, challenge];
            }).spread(function(user, a, challenge) {
                challenge.id.should.exist;
                return Trial.findOrCreate({
                    user: user.id,
                    challenge: challenge.id
                }).then(function(trial) {
                    // console.log("test trial unit", trial);
                    expect(trial).to.exist;
                    expect(trial.arena).to.exist;
                    expect(trial.userArena).to.exist;
                    done();
                }).catch(done);
            }).catch(done);
        });
    });

    describe('Integration', function() {
        var trial, challenge, challenge2, user;
        beforeEach(function(done) {
            Promise.fulfilled().then(function() {
                return [
                    User.create({
                        username: 'test',
                        password: 'testmodel12'
                    }),
                    Challenge.create({
                        exp: 4
                    }),
                    Challenge.create({
                        exp: 8
                    }),
                ];
            }).spread(function(usr, ch, ch2) {
                user = usr;
                challenge = ch;
                challenge2 = ch2;
                return Trial.create({
                    challenge: ch._id,
                    user: user._id
                });
            }).then(function(tr) {
                trial = tr;
            }).finally(done);

        });
        afterEach(setup.clearDB);
        it('should have exp set only first time', function(done) {
            trial.complete = true;
            trial.save(function(err, trial) {
                if (err) return done(err);
                trial.exp.should.equal(challenge.exp);
                trial.save(function(err, trial) {
                    trial.exp.should.equal(challenge.exp);
                    done();
                });
            });
        });
        it('should count the number of times challenge was completed', function(done) {
            trial.complete = true;
            trial.save(function(err, trial) {
                if (err) return done(err);
                trial.completed.should.equal(1);
                trial.save(function(err, trial) {
                    trial.completed.should.equal(2);
                    done();
                });
            });
        });

        it('should fire complete event work with different trials', function(done) {
            var times = 0;
            observer.on('trial.complete', function(trial) {
                times++;
                // util.log(['completed',times,'trial',trial._id,'awards',trial.exp, 'exp to user '].join(' '));
                if (times === 2) {
                    done();
                }
            });
            Trial.create({
                    challenge: challenge2._id,
                    user: user._id
                },
                function(err, trial2) {
                    trial.complete = true;
                    trial2.complete = true;
                    // util.log('saveing trial '+trial._id);
                    trial.save();
                    // util.log('saveing trial2 '+trial2._id);
                    trial2.save();
                });
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
        var challenge = {
            challenge: {
                name: 'Basic Test',
                setup: "",
                solution: "var x = 20;",
                tests: "",
                description: "create a variable and assign to it the value 20",
                exp: 2,
                isPublished: true
            }
        };
        var trial = {
            trial: {
                code: challenge.solution,
                complete: false,
                tests: {},
                challenge: null,
                user: null
            }
        };


        before(function(done) {
            Promise.fulfilled().then(function() {
                return [
                    Arena.create({}),
                    User.create(student),
                    User.create(teacher),
                    User.create(admin)
                ];
            }).spread(function(ar, st, t, ad) {
                // console.log(st,t,a);
                student._id = st._id;
                student.token = st.token;
                admin._id = ad._id;
                admin.token = ad.token;
                teacher._id = t._id;
                accessToken = teacher.token = t.token;
                challenge.arena = ar.id;
                return Challenge.create({
                    arena: ar.id,
                    isPublished:true
                });
            }).then(function(ch) {
                challenge.id = ch.id;
                trial.trial.challenge = ch.id;
                // return setup.challengeTest(done);
                done();
            }).catch(done);
        });

        // after(setup.clearDB);

        describe("POST", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .post("/trials")
                    .send(trial)
                    .expect(401)
                    .end(done);
            });

            it("should create a trial", function(done) {
                request(api)
                    .post("/trials")
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send(trial)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        // console.log("trial test",res.body);
                        expect(res.body.trial).to.exist;
                        trial.id = res.body.trial._id;
                        // console.log("test post trial id", trial.id);
                        done();
                    });
            });
        });

        describe("GET", function() {

            it("should return a trial by id", function(done) {

                request(api)
                    .get("/trials/" + trial.id)
                    .set('Authorization', 'Bearer ' + accessToken)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.trial._id.should.exist;
                        done();
                    });
            });

            it("should return a list of all trials", function(done) {
                // Promise.fulfilled().then(function() {
                //     return Trial.find().exec();
                // }).then(function(trials) {
                //     trials.length.should.equal(2);
                //     trials[0]._id.toString().shoul.equal(trial.id);
                request(api)
                    .get("/trials")
                    .set('Authorization', 'Bearer ' + accessToken)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.trial.length.should.equal(1);
                        done();
                    });
                // }).catch(done);
            });

            it("should return a list of all trials for arena", function(done) {
                // Promise.fulfilled().then(function() {
                //     return Trial.find().exec();
                // }).then(function(trials) {
                //     trials.length.should.equal(2);
                //     trials[0]._id.toString().shoul.equal(trial.id);
                request(api)
                    .get("/trials")
                    .query({arena:challenge.arena})
                    .set('Authorization', 'Bearer ' + accessToken)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.trial.length.should.equal(1);
                        done();
                    });
                // }).catch(done);
            });
        });

        describe("PUT", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .put("/trials/" + trial.id)
                    .send(trial)
                    .expect(401)
                    .end(done);
            });

            // it("should not update someone elses trial", function(done) {
            //     request(api)
            //         .put("/trials/" + trial.id)
            //         .set('Authorization', 'Bearer ' + student.token)
            //         .send({
            //             trial: {
            //                 complete: true
            //             }
            //         })
            //         .expect(401)
            //         .end(done);
            // });

            it("should update own trial if you're a student", function(done) {
                Trial.create({
                    user: student._id,
                    challenge: challenge.id,
                }).then(function(tr) {
                    request(api)
                        .put("/trials/" + tr.id)
                        .set('Authorization', 'Bearer ' + student.token)
                        .send({
                            trial: {
                                complete: true
                            }
                        })
                        .end(function(err, res) {
                            if (err) return done(err);
                            res.status.should.equal(200);
                            res.body.trial.complete.should.be.true;
                            trial.trial.complete = res.body.trial.complete;
                            done();
                        });
                });
            });

            // it("should run trial code", function(done) {
            //     Trial.create({
            //         user:student._id,
            //         challenge:challenge.id,
            //     }).then(function(tr){
            //         request(api)
            //         .put("/trials/" + tr.id+"/run")
            //         .set('Authorization', 'Bearer ' + student.token)
            //         .send(trial)
            //         .expect(200)
            //         .end(done);
            //     });
            // });

            // it("should submit trial code", function(done) {
            //     Trial.create({
            //         user:student._id,
            //         challenge:challenge.id,
            //     }).then(function(tr){
            //         request(api)
            //         .put("/trials/" + tr.id+"/submit")
            //         .set('Authorization', 'Bearer ' + student.token)
            //         .send(trial)
            //         .expect(200)
            //         .end(done);
            //     });
            // });

            it("should update a trial if teacher regardless of ownership", function(done) {
                request(api)
                    .put("/trials/" + trial.id)
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send({
                        trial: {
                            complete: false
                        }
                    })
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.trial.complete.should.be.false;
                        trial.complete = res.body.trial.complete;
                        done();
                    });
            });
        });

        describe("DELETE", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .del("/trials/" + trial.id)
                    .expect(401)
                    .end(done);
            });

            it("should not delete someone elses trial if you're a student", function(done) {
                request(api)
                    .del("/trials/" + trial.id)
                    .set('Authorization', 'Bearer ' + student.token)
                    .send()
                    .expect(401)
                    .end(done);
            });

            it("should delete own trial if you're a student", function(done) {
                Trial.create({
                    user: student._id,
                    challenge: challenge.id,
                }).then(function(tr) {
                    request(api)
                        .del("/trials/" + tr.id)
                        .set('Authorization', 'Bearer ' + student.token)
                        .send()
                        .expect(200)
                        .end(done);
                });
            });

            it("should delete trial if teacher regardless of ownership", function(done) {

                request(api)
                    .del("/trials/" + trial.id)
                    .set('Authorization', 'Bearer ' + accessToken)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        Trial.findById(trial.id, function(err, model) {
                            expect(model).to.not.exist;
                            done();
                        });
                    });
            });
        });

    });
    //*/
});
