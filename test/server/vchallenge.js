/*globals before,after,beforeEach,afterEach,describe,it */
var Promise = require('bluebird');
var should = require('chai').should();
var assert = require('chai').assert;
var expect = require('chai').expect;
var request = require('supertest');
var setup = require('./setup');
var VChallenge = require('../../back/models/vchallenge');
var Arena = require('../../back/models/arena');
var ArenaTrial = require('../../back/models/arenaTrial');
var Trial = require('../../back/models/trial');
var User = require('../../back/models/user');
var observer = require('../../back/observer');



describe('VChallenge', function() {
    before(setup.clearDB);

    var code = 'char c =\'a\'; int a = 40, b = 20; System.out.print("a - b = " + (a - b));';
    var testvchallenge = {
        language: 'java',
        tests: '\
        $main(); \
  if ($userOut.toString().equals("a - b = 20")) {\
    $test.pass("you did it!");\
  } else {\
   $test.fail("it\'s "+$userOut.toString()+" to equal "+"a - b = 20"); \
  }',
        postCode: '//comment won\'t be striped\n char y = \'1\';',
        preCode: '//comment to be striped',
        exp: 1
    };
    var out = "a - b = 20";

    describe('Code', function() {
        it('should run java', function(done) {
            VChallenge.run(code, testvchallenge).spread(function(sterr, stout) {
                if (sterr) return done(sterr);
                stout.should.equal(out);
                done();
            }).catch(done);
        });
        it('should run java and show error', function(done) {
            VChallenge.run(code + '\n x = 3', testvchallenge).spread(function(sterr, stout) {
                sterr.should.exist;
                // stout.should.equal(out);
                done();
            }).catch(done);
        });

        it('should test java', function(done) {
            VChallenge.test(code, testvchallenge, testvchallenge).spread(function(report, stout, sterr) {
                if (sterr) return done(sterr);
                // console.log(stout);
                expect(report).to.have.property('passed', true);
                done();
            }).catch(done);
        });
    });
    describe('Trials', function() {
        var vchallenge, arenaTrial, trials, user, num = 10;
        beforeEach(function(done) {
            Promise.fulfilled()
                .then(function() {
                    var at = ArenaTrial.create({});
                    var ch = VChallenge.create({});
                    var ch2 = VChallenge.create({});
                    var usr = User.create({
                        username: 'testuser',
                        password: 'testuser12'
                    });
                    return [at, ch, ch2, usr];
                })
                .spread(function(at, ch, ch2, usr) {
                    vchallenge = ch;
                    arenaTrial = at;
                    user = usr;
                    var arr = Array(num);
                    var chs = Promise.each(arr, function() {
                        return Trial.create({
                            vchallenge: ch._id,
                            arenaTrial: at._id,
                            user: usr
                        });
                    });
                    var chs2 = Promise.each(arr, function() {
                        return Trial.create({
                            vchallenge: ch2._id,
                            arenaTrial: at._id,
                            user: usr

                        });
                    });

                    return [chs, chs2];
                }).spread(function(chs, chs2) {
                    trials = chs.concat(chs2);
                    return [
                        ArenaTrial.findOne({
                            _id: arenaTrial._id
                        }).exec(),
                        VChallenge.findOne({
                            _id: challenge._id
                        }).exec()
                    ];
                }).spread(function(at, ch) {
                    arenaTrial = at;
                    vchallenge = ch;
                })
                .finally(done);
        });
        afterEach(setup.clearDB);

        it('should remove themselves from their arenaTrial after challenge is removed', function(done) {
            trials.length.should.equal(num * 2);
            arenaTrial.trials.length.should.equal(num * 2);
            vchallenge.trials.length.should.equal(num);

            observer.on('test.challenge.trials.removed', function(arenaTrialTrials, vchallengeTrials) {
                expect(arenaTrialTrials).to.equal(arenaTrial.trials.length - vchallengeTrials);
                done();
            });
            vchallenge.remove();
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
        var arena;
        var vchallenge = {
            vchallenge: {
                name: 'Basic Test',
                setup: "",
                solution: "var x = 20;",
                tests: "",
                preCode: "",
                postCode: "",
                description: "create a variable and assign to it the value 20",
                exp: 2,
                isPublished: false
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
            }).spread(function(arena, st, t, a) {
                // console.log(st,t,a);
                student._id = st._id;
                student.token = st.token;
                admin._id = a._id;
                admin.token = a.token;
                teacher._id = t._id;
                accessToken = teacher.token = t.token;
                vchallenge.vchallenge.arena = arena.id;
                done();
            }).catch(done);
        });

        describe("POST", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .post("/vchallenges")
                    .send(vchallenge)
                    .expect(401)
                    .end(done);
            });

            it("should not create a vchallenge if student", function(done) {
                request(api)
                    .post("/vchallenges")
                    .set('Authorization', 'Bearer ' + student.token)
                    .send(vchallenge)
                    .expect(401)
                    .end(done);

            });

            it("should create a vchallenge only if teacher", function(done) {
                request(api)
                    .post("/vchallenges")
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send(vchallenge)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.vchallenge._id.should.exist;
                        res.body.vchallenge.name.should.equal(vchallenge.vchallenge.name);
                        res.body.vchallenge.exp.should.equal(vchallenge.vchallenge.exp);
                        res.body.vchallenge.arena.should.equal('' + vchallenge.vchallenge.arena);
                        vchallenge.id = res.body.vchallenge._id;
                        done();
                    });

            });

            it("should run code based on language returning stout and sterr", function(done) {
                request(api)
                    .post("/vchallenges/run")
                    .set('Authorization', 'Bearer ' + student.token)
                    .send({
                        code: code,
                        language: 'java'
                    })
                    .expect(200)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.stout.should.equal(out);
                        done();
                    });
            });
            it("should run code with inputs", function(done) {
                request(api)
                    .post("/vchallenges/run")
                    .set('Authorization', 'Bearer ' + student.token)
                    .send({
                        code: code,
                        language: 'java',
                        inputs: ['int x']
                    })
                    .expect(200)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.stout.should.equal(out);
                        done();
                    });
            });
            it("should test code", function(done) {
                request(api)
                    .post("/vchallenges/test")
                    .set('Authorization', 'Bearer ' + student.token)
                    .send({
                        code: code,
                        vchallenge: testvchallenge
                    })
                    .expect(200)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        // console.log(res.body.report);
                        // console.log(res.body.stout);
                        // console.log(res.body.sterr);
                        res.body.report.passed.should.be.true;
                        done();
                    });
            });
        });

        describe("GET", function() {

            it("should return 404 if not correct id", function(done) {
                request(api)
                    .get("/vchallenges/" + "54ffff7fffcbcfffefff5fff")
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(404);
                        done();
                    });
            });

            it("should return a vchallenge by id", function(done) {
                request(api)
                    .get("/vchallenges/" + challenge.id)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        expect(res.body.vchallenge).to.exist;
                        done();
                    });
            });

            it("should return a list of all vchallenges", function(done) {
                request(api)
                    .get("/vchallenges")
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.vchallenge.length.should.gte(1); // 3 from setup + 1 from post
                        done();
                    });
            });

        });

        describe("PUT", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .put("/vchallenges/" + vchallenge.id)
                    .send(vchallenge)
                    .expect(401)
                    .end(done);
            });

            it("should not create a vchallenge if student", function(done) {
                request(api)
                    .put("/vchallenges/" + vchallenge.id)
                    .set('Authorization', 'Bearer ' + student.token)
                    .send({
                        vchallenge: {
                            isPublished: true
                        }
                    })
                    .expect(401)
                    .end(done);

            });

            it("should update a vchallenge only if teacher", function(done) {
                request(api)
                    .put("/vchallenges/" + challenge.id)
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send({
                        vchallenge: {
                            isPublished: true
                        }
                    })
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.vchallenge.isPublished.should.equal(true);
                        vchallenge.isPublished = res.body.vchallenge.isPublished;
                        done();
                    });
            });
        });

        describe("DELETE", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .del("/vchallenges/" + vchallenge.id)
                    .expect(401)
                    .end(done);
            });

            it("should not delete a vchallenge if student", function(done) {
                request(api)
                    .del("/vchallenges/" + vchallenge.id)
                    .set('Authorization', 'Bearer ' + student.token)
                    .send()
                    .expect(401)
                    .end(done);

            });

            it("should delete a vchallenge removing it from it's arena", function(done) {
                request(api)
                    .del("/vchallenges/" + challenge.id)
                    .set('Authorization', 'Bearer ' + accessToken)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        VChallenge.findOne({
                            _id: vchallenge.id
                        }).exec().then(function(model) {
                            expect(model).to.not.exist;
                        }, done).then(function() {
                            Arena.findById(vchallenge.vchallenge.arena, function(err, arena) {
                                arena.vchallenges.length.should.equal(0);
                                done();
                            });
                        }, done);
                    });
            });
        });

    });
    //*/
});
