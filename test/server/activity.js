/*globals before,after,beforeEach,afterEach,describe,it */
var Promise = require('bluebird');
var _ = require('lodash');
var should = require('chai').should();
var expect = require('chai').expect;
var request = require('supertest-as-promised');
var io = require('socket.io-client');
var setup = require('./setup');
var Activity = require('../../back/models/activity');
var Challenge = require('../../back/models/challenge');
var Trial = require('../../back/models/trial');
var User = require('../../back/models/user');
var observer = require('../../back/observer');


describe('Activity', function() {
    before(function(done) {
        return setup.clearDB(done);
    });

    describe('Unit', function() {
        var student,
            student2,
            teacher,
            activity, challenge, challenge2;
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
                    User.create(student2),
                    Challenge.create({}),
                ];
            }).spread(function(t, st, st2, ch) {
                student = st;
                student2 = st2;
                challenge = ch;
                var at = Activity.create({});
                return [at];
            }).spread(function(g) {
                activity = g;
                expect(activity).to.exist;
            }).finally(done);
        });
        afterEach(setup.clearDB);

        it('should create an activity', function(done) {
            Activity.new({subject:student, action:'started', object:challenge}).then(function (act) {
                should.exist(act);
            }).finally(done);
        });

        it('should be able to get subject', function(done) {
            Activity.new({subject:student, action:'started', object:challenge}).then(function (act) {
                return act.getSubject();
            }).then(function (subject) {
                student.id.should.equal(subject.id);
            }).finally(done);
        });

        it('should be able to get object', function(done) {
            Activity.new({subject:student, action:'started', object:challenge}).then(function (act) {
                return act.getObject();
            }).then(function (object) {
                challenge.id.should.equal(object.id);
            }).finally(done);
        });


        it('should log when a user signs up', function(done) {
            request(setup.url)
            .post("/signup")
            .send({
                username: "amr.dr",
                password: "drazdraz12",
                passwordConfirmation: "drazdraz12"
            })
            .expect(200)
            .then(function (res) {
               return Activity.findByVerb('signuped'); 
            }).then(function (acts) {
                should.exist(acts);
                acts.length.should.equal(1);
                acts[0].verb.should.equal('signuped');
                acts[0].action.should.equal('signup');
                done();
            }).catch(done);
        });

        it('should log when a user verifies account', function(done) {
            request(setup.url)
            .post("/signup")
            .send({
                username: "amrdr",
                email: "amr.draz@guc.edu.eg",
                password: "drazdraz12",
                passwordConfirmation: "drazdraz12"
            })
            .expect(200)
            .then(function (res) {
                var activationToken = res.body.activation_token;
                return request(setup.url)
                    .get("/verify/" + activationToken)
                    .expect(200);
            }).then(function (res) {
                return Activity.findByVerb('verified'); 
            }).then(function (acts) {
                should.exist(acts);
                acts.length.should.equal(1);
                acts[0].verb.should.equal('verified');
                acts[0].action.should.equal('verify');
                done();
            }).catch(done);
        });

        it('should log when a user verifies account', function(done) {
            request(setup.url)
            .post("/signup")
            .send({
                username: "amrdr",
                email: "amr.draz@guc.edu.eg",
                password: "drazdraz12",
                passwordConfirmation: "drazdraz12"
            })
            .expect(200)
            .then(function (res) {
                var activationToken = res.body.activation_token;
                return request(setup.url)
                    .get("/verify/" + activationToken)
                    .expect(200);
            }).then(function (res) {
                return request(setup.url)
                    .post("/token")
                    .send({
                        identification: "amrdr",
                        password: "drazdraz12",
                    })
                    .expect(200);
            }).then(function (res) {
                return Activity.findByVerb('logedin'); 
            }).then(function (acts) {
                should.exist(acts);
                acts.length.should.equal(1);
                acts[0].verb.should.equal('logedin');
                acts[0].action.should.equal('login');
                done();
            }).catch(done);
        });

        it('should log when a user verifies account', function(done) {
            request(setup.url)
            .post("/signup")
            .send({
                username: "amrdr",
                email: "amr.draz@guc.edu.eg",
                password: "drazdraz12",
                passwordConfirmation: "drazdraz12"
            })
            .expect(200)
            .then(function (res) {
                var activationToken = res.body.activation_token;
                return request(setup.url)
                    .get("/verify/" + activationToken)
                    .expect(200);
            }).then(function (res) {
                return request(setup.url)
                    .post("/token")
                    .send({
                        identification: "amrdr",
                        password: "drazdraz12",
                    })
                    .expect(200);
            }).then(function (res) {
                return request(setup.url)
                    .del("/logout")
                    .set('Authorization', 'Bearer ' + res.body.access_token)
                    .expect(204);
            }).then(function (res) {
                return Activity.findByVerb('logedout'); 
            }).then(function (acts) {
                should.exist(acts);
                acts.length.should.equal(1);
                acts[0].verb.should.equal('logedout');
                acts[0].action.should.equal('logout');
                done();
            }).catch(done);
        });

        
        var options = {
            'force new connection': true
        };
        it('Should log when user connects with socket', function(done) {
            var client1, client2, client3;
            var message = 'Hello World';
            var messages = 0;

            client1 = io.connect(setup.url, options);
            
            client1.on('connect', function() {
                client1.emit('login', student.id);
            });
            client1.on('test.connect.response', function () {
                Activity.findByAction('connect').then(function (act) {
                   return act[0].getSubject(); 
                }).then(function (subject) {
                    subject.id.should.equal(student.id);
                    client1.disconnect();
                    done();
                });
            });
        });
        // it('Should log when user disconnects from sockets', function(done) {
        //     var client1, client2, client3;
        //     var message = 'Hello World';
        //     var messages = 0;

        //     client1 = io.connect(setup.url, options);
            
        //     client1.on('connect', function() {
        //         client1.emit('login', student.id);
        //     });
        //     client1.on('test.connect.response', function () {
        //         client1.disconnect();
        //     });
        //     console.log(observer);
        //     observer.on('test.disconnect.response', function (act) {
        //         console.log("disconnected");
        //         act.getSubject().then(function (subject) {
        //             subject.id.should.equal(student.id);
        //             done();
        //         });
        //     });
        //     client1.on('disconnect', function () {
        //         _.delay(function (argument) {
        //             Activity.findByAction('disconnect').then(function (act) {
        //                return act[0].getSubject(); 
        //             }).then(function (subject) {
        //                 subject.id.should.equal(student.id);
        //                 client1.disconnect();
        //                 done();
        //             });
        //         }, 400);
        //     });
        // });

        
    });
});