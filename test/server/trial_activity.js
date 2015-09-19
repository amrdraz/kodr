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


describe('Trial Activity', function() {
    before(function(done) {
        return setup.clearDB(done);
    });

    describe('Unit', function() {
        var student,
            trial,
            activity, challenge;
        beforeEach(function(done) {
            student = {
                username: 'student',
                email: 'student@place.com',
                password: 'student123',
                role: 'student',
                activated: true
            };
            Promise.fulfilled().then(function() {
                return [
                    User.create(student),
                    Challenge.create({}),
                ];
            }).spread(function(st, ch, at) {
                student = st;
                challenge = ch;
                return Trial.create({challenge:ch.id, user:st.id});
            }).then(function (tr) {
                trial = tr;
            }).finally(done);
        });
        afterEach(setup.clearDB);

        it('should create log when a user starts a trial', function(done) {
            Activity.new({subject:student, action:'started', object:trial, objectMeta:{}}).then(function (act) {
                should.exist(act);
            }).finally(done);
        });
        
        var options = {
            'force new connection': true
        };
        it('Should log when user connects with socket', function(done) {
            var client1, client2, client3;

            client1 = io.connect(setup.url, options);
            
            client1.on('connect', function() {
                client1.emit('trial.event', {event:'trial.start', action:"start", trial:trial.toJSON(), meta:{
                    state:{
                        activeInterfaces:['solution', 'console']
                    },
                    flags:{
                        'no_setup':true
                    }
                }});
            });
            client1.on('test.trial.event.response', function (act) {
                Activity.findByEvent('trial.start').then(function (act) {
                   return [act[0].getSubject(), act[0].getObject()]; 
                }).spread(function (subj, obj) {
                    expect(obj.id, trial.id);
                    expect(subj.id, student.id);
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