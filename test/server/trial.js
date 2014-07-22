/*globals before,after,describe,it */
var should = require('chai').should();
var assert = require('chai').assert;
var expect = require('chai').expect;
var request = require('supertest');
var setup = require('./setup');
var Trial = require('../../back/models/trial');



describe('Trial', function() {
    before(function(done) {
        return setup.clearDB(done);
    });
    describe("API", function() {
        var url = 'http://localhost:3000';
        var api = url + '/api';
        var user = {
            username: "amr",
            email: "amr.m.draz@gmail.com",
            password: "drazdraz",
            passwordConfirmation: "drazdraz"
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
                isPublished: false
            }
        };
        var trial = {
            trial : {
                code: challenge.setup,
                completed: false,
                tests: {},
                challenge: null,
                user: null
            }
        };


        before(function(done) {
            request(url)
                .post("/signup")
                .send(user)
                .end(function(err, res) {
                    if (err) return done(err);
                    console.log(res.text);
                    expect(res.status).to.equal(200);
                    request(url)
                        .post("/token")
                        .send(user)
                        .end(function(err, res) {
                            if (err) return done(err);
                            expect(res.status).to.equal(200);
                            accessToken = res.body.access_token;
                            request(api)
                                .post("/challenges")
                                .set('Authorization', 'Bearer ' + accessToken)
                                .send(challenge)
                                .end(function(err, res) {
                                    if (err) return done(err);
                                    res.status.should.equal(200);
                                    challenge.id = res.body.challenge._id;
                                    trial.trial.challenge = challenge.id;
                                    done();
                                });
                        });
                });
        });

        after(function(done) {
            Trial.remove({}, function(err) {
                if (err) return done(err);
                done();
            });
        });

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
                        res.body.trial.times.should.equal(0);
                        trial.id = res.body.trial._id;
                        done();
                    });
            });
        });

        describe("GET", function() {

            it("should return a trial by id", function(done) {
                request(api)
                    .get("/trials/" + trial.id)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.trial._id.should.exist;
                        done();
                    });
            });

            it("should return a list of all trials", function(done) {
                request(api)
                    .get("/trials")
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.trial.length.should.equal(1);
                        done();
                    });
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

            it("should update a trial without user", function(done) {
                request(api)
                    .put("/trials/" + trial.id)
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send({
                        trial: {
                            completed: true
                        }
                    })
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.trial.completed.should.be.true;
                        trial.completed = res.body.trial.completed;
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

            it("should delete a trial without user", function(done) {
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
