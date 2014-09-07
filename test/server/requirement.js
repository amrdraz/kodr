/*globals before,after,beforeEach,afterEach,describe,it */
var Promise = require('bluebird');
var should = require('chai').should();
var expect = require('chai').expect;
var request = require('supertest');
var setup = require('./setup');
var Quest = require('../../back/models/quest');
var UserQuest = require('../../back/models/userQuest');
var Requirement = require('../../back/models/requirement');
var Challenge = require('../../back/models/challenge');
var Trial = require('../../back/models/trial');
var Arena = require('../../back/models/arena');
var User = require('../../back/models/user');
var observer = require('../../back/mediator');


describe('UserQuest', function() {
    before(function(done) {
        return setup.clearDB(done);
    });

    describe('Unit', function() {
        var student,
            student2,
            teacher,
            quest, challenge, challenge2;
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
                    Challenge.create({exp:20}),
                ];
            }).spread(function(t, st, st2,ch) {
                student = st;
                student2 = st2;
                challenge = ch;
                var at = Quest.create({
                    name: "start of a journey",
                    description: "you got 10 exp points",
                    requirements: [{
                        model1: 'Challenge',
                        model2: 'Arena',
                        times: 1,
                    }],
                    author: teacher.id
                });
                return [at];
            }).spread(function(g) {
                quest = g;
                expect(quest).to.exist;
                // console.log(quest);
                return [User.findOne({
                    _id: teacher.id
                }).exec(), User.findOne({
                    _id: student.id
                }).exec()];
            }).spread(function(t, st) {
                student = st;
                teacher = t;
            }).finally(done);
        });
        afterEach(setup.clearDB);

        it('should CreateOrAssociate', function (done) {
            done();
        });

    });
});
