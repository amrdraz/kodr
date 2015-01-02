/*globals before,after,beforeEach,afterEach,describe,it */
var Promise = require('bluebird');
var should = require('chai').should();
var expect = require('chai').expect;
var request = require('supertest-as-promised');
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
                username: "amrdr",
                email: "amr.draz@guc.edu.eg",
                password: "drazdraz12",
                passwordConfirmation: "drazdraz12"
            })
            .expect(200)
            .then(function (res) {
               return Activity.findByAction('signedup'); 
            }).then(function (acts) {
                should.exist(acts);
                acts.length.should.equal(1);
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
                return Activity.findByAction('verified'); 
            }).then(function (acts) {
                should.exist(acts);
                acts.length.should.equal(1);
                done();
            }).catch(done);
        });

        
    });
});