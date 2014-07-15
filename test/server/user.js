/*globals before,after,describe,it */

var should = require('chai').should();
var expect = require('chai').expect;
var request = require('supertest');
var setup = require('./setup');
var User = require('../../back/models/user');

describe('User', function() {
    before(function (done) {
        return setup.clearDB(done);
    });
    describe("Auth", function() {
        var url = 'http://localhost:3000';
        var user = {
                username: "amr",
                email:"amr.m.draz@gmail.com",
                password: "draz",
                passwordConfirmation: "draz"
            };
        var accessToken;

        after(function (done) {
            User.findOneAndRemove({email:user.email}, function (err) {
                if(err) return done(err);
                done();
            });
        });

        describe("Signup", function() {

            it("should add new user by username email and password", function(done) {
                request(url)
                .post("/signup")
                .send(user)
                .end(function (err,res) {
                    if(err) return done(err);
                    res.status.should.equal(200);
                    done();
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
                .end(function (err, res) {
                    if (err) return done(err);
                    
                    res.body.should.have.property("access_token");
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
                .end(function (err, res) {
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
                .send({username:'draz'})
                .end(function (err,res) {
                    if(err) return done(err);
                    res.status.should.equal(200);
                    request(url)
                    .get("/profile")
                    .set('Authorization', 'Bearer ' + accessToken)
                    .end(function (err,res) {
                        if(err) return done(err);
                        res.status.should.equal(200);
                        res.body.username.should.not.equal(user.username);
                        user.username = res.body.username;
                        user.oldPassword = res.body.password;

                        request(url)
                        .post("/token")
                        .send(user)
                        .end(function (err, res) {
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
                .send({password:'amr'})
                .end(function (err,res) {
                    if(err) return done(err);
                    res.status.should.equal(200);

                    request(url)
                    .post("/token")
                    .send({username:'draz', password:'amr'})
                    .expect(200)
                    .end(function (err, res) {
                        if (err) return done(err);
                        res.body.access_token.should.not.equal(accessToken);
                        accessToken = res.body.access_token;
                        done();
                    });
                    });
            });
        });


        
    });
//*/
});
