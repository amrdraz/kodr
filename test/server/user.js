/*globals before,beforeEach,after,afterEach,describe,it */

var should = require('chai').should();
var expect = require('chai').expect;
var request = require('supertest-as-promised');
var Promise = require('bluebird');
var setup = require('./setup');
var User = require('../../back/models/user');
var Arena = require('../../back/models/arena');
var ArenaTrial = require('../../back/models/arenaTrial');
var Trial = require('../../back/models/trial');
var Challenge = require('../../back/models/challenge');
var observer = require('../../back/mediator');

describe('User', function() {
    before(setup.clearDB);
    describe('Trial', function() {
        var user, arena, trial, trial2;
        beforeEach(function(done) {

            Promise.fulfilled()
                .then(function() {
                    var ar = Arena.create({});
                    var usr = User.create({
                        username: 'test',
                        password: 'testmodel2'
                    });
                    return [ar, usr];
                })
                .spread(function(ar, usr, t, st, st2) {
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
                    return [ch, ch2];
                })
                .spread(function(ch1, ch2) {
                    var tr = Trial.create({
                        challenge: ch1._id,
                        user: user._id
                    });
                    var tr2 = Trial.create({
                        challenge: ch2._id,
                        user: user._id
                    });
                    return [tr, tr2];
                })
                .spread(function(tr, tr2) {
                    trial = tr;
                    trial2 = tr2;
                    done();
                })
                .catch(done);
        });
        afterEach(setup.clearDB);

        it('should increase user exp after completion', function(done) {
            trial.complete = true;
            observer.once('user.awarded', function(user, type, value) {
                user.exp.should.equal(trial.exp);
                done();
            });
            trial.save();
        });
        it('should increase user exp with resepct to all tials completed', function(done) {
            trial.complete = true;
            trial2.complete = true;
            var times = 0;
            observer.on('user.awarded', function(user, type, value) {
                times++;
                // console.log('assigned user exp ', user.exp, ' after adding ', value);

                if (times === 2) {
                    user.exp.should.equal(trial.exp + trial2.exp);
                    done();
                }
            });
            trial.save(function(err, m) {
                trial = m;
                trial2.save(function(err, m) {
                    trial2 = m;
                });
            });

        });
    });
    describe("Auth", function() {
        var url = 'http://localhost:3000';
        var user = {
            username: "amrd",
            email: "amr.m.draz@gmail.com",
            password: "drazdraz12",
            passwordConfirmation: "drazdraz12"
        }, 
        teacher = {
            username: 'teacher',
            email: 't.t@guc.edu.eg',
            password: 'testmodel12',
            passwordConfirmation: 'testmodel12'
        }, 
        student = {
            username: 'student',
            email: 's.s@student.guc.edu.eg',
            password: 'testmodel12',
            passwordConfirmation: 'testmodel12'
        };
        var accessToken;

        after(setup.clearDB);

        describe("Signup", function() {

            it("should add new user by username email and password", function(done) {
                request(url)
                    .post("/signup")
                    .send(user)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        done();
                    });
            });
            it("should assign role student based on email", function(done) {
                request(url)
                    .post("/signup")
                    .send(student)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        User.find({role:'student'}).exec(function(err,users){
                            if (err) return done(err);
                            users.length.should.equal(1);
                            done();
                        });
                    });
            });
            it("should assign role teacher based on email", function(done) {
                request(url)
                    .post("/signup")
                    .send(teacher)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        User.find({role:'teacher'}).exec(function(err,users){
                            if (err) return done(err);
                            users.length.should.equal(1);
                            done();
                        },done);
                    });
            });

            it("should send and email to amrmdraz@gmail.com", function(done) {
                request(url)
                    .post("/signup")
                    .send({
                        username: "drazious",
                        email: "amrmdraz@gmail.com",
                        password: "drazdraz12",
                        passwordConfirmation: "drazdraz12"
                    })
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        console.log(res.body);
                        User.findOne({username:'drazious'}).exec(function(err,user){
                            if (err) return done(err);
                            expect(user).to.exist;
                            done();
                        },done);
                    });
            });
        });

        describe("Login", function() {

            it("should login with username", function(done) {
                request(url)
                    .post("/token")
                    .send(user)
                    .expect(200)
                    .end(done);
            });

            it("should return a token", function(done) {
                request(url)
                    .post("/token")
                    .send(user)
                    .expect(200)
                // .expect('Content-Type', /json/)
                .end(function(err, res) {
                    if (err) return done(err);

                    res.body.should.have.property("access_token");
                    res.body.should.have.property("user_id");
                    accessToken = res.body.access_token;
                    done();
                });
            });
        });
        describe("Profile", function() {
            it("access should not work without token", function(done) {
                request(url)
                    .get("/profile")
                    .expect(401)
                    .end(done);
            });

            it("acess should work with token", function(done) {
                request(url)
                    .get("/profile")
                    .set('Authorization', 'Bearer ' + accessToken)
                    .expect(200)
                    .end(done);
            });

            it("should return User object", function(done) {
                request(url)
                    .get("/profile")
                    .set('Authorization', 'Bearer ' + accessToken)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.body.username.should.equal(user.username);
                        res.body.email.should.equal(user.email);
                        res.body.should.have.property("_id");
                        user._id = res.body._id;
                        done();
                    });
            });
        });

        describe("Token", function() {

            it("should not change after User is saved", function(done) {
                request(url)
                    .post("/profile")
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send({
                        username: 'draz'
                    })
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        request(url)
                            .get("/profile")
                            .set('Authorization', 'Bearer ' + accessToken)
                            .end(function(err, res) {
                                if (err) return done(err);
                                res.status.should.equal(200);
                                res.body.username.should.not.equal(user.username);
                                user.username = res.body.username;
                                user.oldPassword = res.body.password;

                                request(url)
                                    .post("/token")
                                    .send(user)
                                    .end(function(err, res) {
                                        if (err) return done(err);
                                        res.status.should.equal(200);
                                        res.body.access_token.should.equal(accessToken);
                                        done();
                                    });
                            });
                    });

            });

            it("should change after User password is changed", function(done) {
                request(url)
                    .post("/profile")
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send({
                        password: 'amramree12'
                    })
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);

                        request(url)
                            .post("/token")
                            .send({
                                username: 'draz',
                                password: 'amramree12'
                            })
                            .expect(200)
                            .end(function(err, res) {
                                if (err) return done(err);
                                res.body.access_token.should.not.equal(accessToken);
                                accessToken = res.body.access_token;
                                done();
                            });
                    });
            });
        });
    });
    describe('API', function () {
        var url = 'http://localhost:3000';
        var api = url + '/api';
        var ruser = {
            username: "draz",
            email: "amr.m.draz@gmail.com",
            password: "drazdraz12",
            passwordConfirmation: "drazdraz12"
        };
        var accessToken;
        var user = {
            user: {
                username:'testuser',
                password:'testspass2'
            }
        };


        before(function(done) {
            request(url)
                .post("/signup")
                .send(ruser)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.status).to.equal(200);
                    request(url)
                        .post("/token")
                        .send(ruser)
                        .end(function(err, res) {
                            if (err) return done(err);
                            expect(res.status).to.equal(200);
                            accessToken = res.body.access_token;
                           done();
                        });
                });
        });

        after(setup.clearDB);

        describe("POST", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .post("/users")
                    .send(user)
                    .expect(401)
                    .end(done);
            });

            it("should create a user", function(done) {
                request(api)
                    .post("/users")
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send(user)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        expect(res.body.user).to.exist;
                        user.id = res.body.user._id;
                        done();
                    });
            });
        });

        describe("GET", function() {

            it("should return a user by id", function(done) {
                request(api)
                    .get("/users/" + user.id)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.user._id.should.exist;
                        done();
                    });
            });

            it("should return a list of all users", function(done) {
                return request(api)
                    .get("/users")
                    .then(function (res) {
                        res.status.should.equal(200);
                        res.body.user.length.should.equal(2);
                        done();
                    });
            });

        });

        describe("PUT", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .put("/users/" + user.id)
                    .send(user)
                    .expect(401)
                    .end(done);
            });

            it("should update a user", function(done) {
                return request(api)
                    .put("/users/" + user.id)
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send({
                        user: {
                            password:'newpass121'
                        }
                    })
                    .then(function(res) {
                        res.status.should.equal(200);
                        user.complete = res.body.user.complete;
                        done();
                    });
            });
        });

        describe("DELETE", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .del("/users/" + user.id)
                    .expect(401)
                    .end(done);
            });

            it("should delete a user without user", function(done) {
                request(api)
                    .del("/users/" + user.id)
                    .set('Authorization', 'Bearer ' + accessToken)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        Trial.findById(user.id, function(err, model) {
                            expect(model).to.not.exist;
                            done();
                        });
                    });
            });
        });
    });
    //*/
});
