/*globals before,beforeEach,after,afterEach,describe,it */

var should = require('chai').should();
var expect = require('chai').expect;
var request = require('supertest-as-promised');
var Promise = require('bluebird');
var setup = require('./setup');
var User = require('../../back/models/user');
var ExpiringToken = require('../../back/models/expiringToken');
var Arena = require('../../back/models/arena');
var ArenaTrial = require('../../back/models/arenaTrial');
var Trial = require('../../back/models/trial');
var Challenge = require('../../back/models/challenge');
var Group = require('../../back/models/group');
var observer = require('../../back/mediator');

describe('User', function() {
    before(setup.clearDB);

    describe('Unit', function () {
        var user;
        beforeEach(function  () {
            user = new User({
                username:'2314',
                password:'1243j1k2412hj'
            })
        })

        it('has points', function () {
            user.exp = 20;
            user.rp = 30;
            user.points.should.equal(50);
        });
    });

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

    describe('Group', function() {
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
                st.password = student.password;
                student = st;
                t.password = teacher.password;
                teacher = t;
            }).finally(done);
        });
        afterEach(setup.clearDB);

        // it('should add memeber', function(done) {
        //     group.members.length.should.equal(1);
        //     expect(student2.group).to.not.exist;
        //     student2.group = group._id;
        //     student2.save(function(err, group) {
        //         if (err) return done(err);
        //         expect(student2.group).to.exist;
        //         // console.log(student2._id);
        //         Group.findOne({
        //             _id: group._id
        //         }, function(err, g) {
        //             if (err) return done(err);
        //             // console.log(user);
        //             g.members.length.should.equal(2);
        //             done();
        //         });
        //     });
        // });

        // it('should remove memeber', function(done) {
        //     group.members.length.should.equal(1);
        //     student.group = undefined;
        //     student.save(function(err, user) {
        //         if (err) return done(err);
        //         expect(student.group).to.not.exist;
        //         // console.log(student2._id);
        //         Group.findById(group._id, function(err, group) {
        //             if (err) return done(err);
        //             // console.log(group);
        //             group.members.length.should.equal(0);
        //             done();
        //         });
        //     });
        // });
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
        var accessToken, activationToken;

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
                        User.find({
                            role: 'student'
                        }).exec(function(err, users) {
                            if (err) return done(err);
                            users.length.should.equal(2);
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
                        User.find({
                            role: 'teacher'
                        }).exec(function(err, users) {
                            if (err) return done(err);
                            users.length.should.equal(1);
                            done();
                        }, done);
                    });
            });

            it("should send and email when a teacher signs up", function(done) {
                request(url)
                    .post("/signup")
                    .send({
                        username: "drazious",
                        email: "amr.deraz@guc.edu.eg",
                        password: "drazdraz12",
                        passwordConfirmation: "drazdraz12"
                    })
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        expect(res.body.info.response).to.exist;
                        activationToken = res.body.token;
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

            it("should return a token and user id", function(done) {
                request(url)
                    .post("/token")
                    .send(user)
                    .expect(200)
                // .expect('Content-Type', /json/)
                .end(function(err, res) {
                    if (err) return done(err);

                    res.body.should.have.property("access_token");
                    res.body.should.have.property("user_id");
                    user.id = res.body.user_id;
                    accessToken = res.body.access_token;
                    done();
                });
            });

            it("should not be able to login as a teacher until activation", function(done) {
                request(url)
                    .post("/token")
                    .send({
                        username: "drazious",
                        password: "drazdraz12",
                    })
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(400);
                        done();
                    });
            });

            it("should activate by accessing link then in email", function(done) {
                request(url)
                    .get("/confirmAccount/" + activationToken)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        ExpiringToken.findById(activationToken, function(err, exp) {
                            if (err) return done(err);
                            exp.used.should.be.true;
                            done();
                        });
                    });
            });

            it("should be able to login as a teacher after activation", function(done) {
                request(url)
                    .post("/token")
                    .send({
                        username: "drazious",
                        password: "drazdraz12",
                    })
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        done();
                    });
            });
        });
        
        describe("Token", function() {

            it("should not change after User is saved", function(done) {
                var newname = 'draz';
                request(url)
                    .post("/profile")
                    .set('Authorization', 'Bearer ' + accessToken)
                    .send({
                        username: newname
                    })
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);                        
                        user.username = res.body.user.username;
                        res.body.user.username.should.equal(newname);
                        res.body.access_token.should.equal(accessToken);
                        done();
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
                        res.body.access_token.should.not.equal(accessToken);
                        done();
                    });
            });
        });
    });
    describe('API', function() {
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


        before(function(done) {

            Promise.fulfilled()
                .then(function() {
                    return [User.create(student),
                        User.create(teacher),
                        User.create(admin)
                    ];
                }).spread(function(st, t, a) {
                    // console.log(st,t,a);
                    student._id = st._id;
                    student.token = st.token;
                    admin._id = a._id;
                    admin.token = a.token;
                    teacher._id = t._id;
                    teacher.token = t.token;
                }).finally(done);
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

            it("should not create as a student", function(done) {
                request(api)
                    .post("/users")
                    .set('Authorization', 'Bearer ' + student.token)
                    .send(user)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(401);
                        done();
                    });
            });

            it("should create as a teacher", function(done) {
                request(api)
                    .post("/users")
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .send(user)
                    .end(function(err, res) {
                        if (err) return done(err);
                        res.status.should.equal(200);
                        expect(res.body.user._id).to.exist;
                        user.id = res.body.user._id;
                        done();
                    });
            });
        });

        describe("GET", function() {

            it("should return a user by id", function(done) {
                request(api)
                    .get("/users/" + user.id)
                    .set('Authorization', 'Bearer ' + teacher.token)
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
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .then(function(res) {
                        res.status.should.equal(200);
                        res.body.user.length.should.equal(4);
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

            it("should not update a user if student", function(done) {
                return request(api)
                    .put("/users/" + user.id)
                    .set('Authorization', 'Bearer ' + student.token)
                    .send({
                        user: {
                            password: 'newpass121'
                        }
                    })
                    .then(function(res) {
                        res.status.should.equal(401);
                        done();
                    });
            });

            it("should update a user if teacher", function(done) {
                return request(api)
                    .put("/users/" + user.id)
                    .set('Authorization', 'Bearer ' + teacher.token)
                    .send({
                        user: {
                            password: 'newpass121'
                        }
                    })
                    .then(function(res) {
                        res.status.should.equal(200);
                        done();
                    });
            });

            it("should update a user if updating himself", function(done) {
                return request(api)
                    .put("/users/" + student._id)
                    .set('Authorization', 'Bearer ' + student.token)
                    .send({
                        user: {
                            password: 'newpass121'
                        }
                    })
                    .then(function(res) {
                        res.status.should.equal(200);
                        done();
                    });
            });
        });

        describe("DELETE", function() {

            it("should not work without access_token", function(done) {
                request(api)
                    .del("/users/" + user.id)
                    .expect(401)
                    .end(done);
            });

            it("should not work if not teacher", function(done) {
                request(api)
                    .del("/users/" + user.id)
                    .set('Authorization', 'Bearer ' + student.token)
                    .end(function(err, res) {
                        if (err) done(err);
                        res.status.should.equal(401);
                        done();
                    });
            });

            it("should delete a user if teacher", function(done) {
                request(api)
                    .del("/users/" + user.id)
                    .set('Authorization', 'Bearer ' + teacher.token)
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
