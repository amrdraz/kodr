/*globals before,after,describe,it */
var should = require('chai').should();
var assert = require('chai').assert;
var expect = require('chai').expect;
var request = require('supertest');
var setup = require('./setup');
var Challenge = require('../../back/models/challenge');



describe('Challenge', function() {

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
                structure: "var _ = 20;",
                callbacks: "{}",
                description: "create a variable and assign to it the value 20",
                exp: 2,
                isPublished: false
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
                            done();
                        });
                });
        });

        after(function(done) {
            Challenge.remove({}, function(err) {
                if (err) return done(err);
                done();
            });
        });

        describe("POST", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .post("/challenges")
                    .send(challenge)
                    .expect(401)
                    .end(done);
            });

            it("should create a challenge", function(done) {
                request(api)
                    .post("/challenges")
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send(challenge)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.challenge._id.should.exist;
                        res.body.challenge.name.should.equal(challenge.challenge.name);
                        res.body.challenge.exp.should.equal(challenge.challenge.exp);
                        challenge.id = res.body.challenge._id;
                        done();
                    });
            });
        });

        describe("GET", function() {

            it("should return a challenge by id", function(done) {
                request(api)
                    .get("/challenges/" + challenge.id)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.challenge._id.should.exist;
                        done();
                    });
            });

            it("should return a list of all challenges", function(done) {
                request(api)
                    .get("/challenges")
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.challenge.length.should.equal(1);
                        done();
                    });
            });

        });

        describe("PUT", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .put("/challenges/" + challenge.id)
                    .send(challenge)
                    .expect(401)
                    .end(done);
            });

            it("should update a challenge without user", function(done) {
                request(api)
                    .put("/challenges/" + challenge.id)
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send({
                        challenge:{isPublished: true}
                    })
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        res.body.challenge.isPublished.should.equal(true);
                        challenge.isPublished = res.body.challenge.isPublished;
                        done();
                    });
            });
        });

        describe("DELETE", function() {

            it("should not work without accessToken", function(done) {
                request(api)
                    .del("/challenges/" + challenge.id)
                    .expect(401)
                    .end(done);
            });

            it("should delete a challenge without user", function(done) {
                request(api)
                    .del("/challenges/" + challenge.id)
                    .set('Authorization', 'Bearer ' + accessToken)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        Challenge.findById(challenge.id, function(err, model) {
                            expect(model).to.not.exist;
                            done();
                        });
                    });
            });
        });

    });
    //*/
});
