/*globals before,after,beforeEach,afterEach,describe,it */
var Promise = require('bluebird');
var _ = require('lodash');
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
var ArenaTrial = require('../../back/models/arenaTrial');
var User = require('../../back/models/user');
var observer = require('../../back/observer');


describe('Requirement', function () {
    
});

describe('UserQuest', function() {
    before(function(done) {
        return setup.clearDB(done);
    });

    describe('Unit', function() {
        var student,
            student2,
            teacher,
            quest, challenges, arena;
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
                    Arena.create({}),
                ];
            }).spread(function(t, st, st2, a) {
                student = st;
                student2 = st2;
                arena = a;
                var chs = Promise.map(new Array(5), function() {
                    return Challenge.create({
                        exp: 2,
                        arena: a._id
                    });
                });
                var q = chs.then(function(chs) {
                    return Quest.create({
                        isPublished: true,
                        requirements: [{
                            model1: 'Challenge',
                            times: 2,
                        }, {
                            model1: 'Challenge',
                            id1: chs[2]._id
                        }, {
                            model1: 'Arena',
                            id1: a._id
                        }, {
                            model1: 'Challenge',
                            model2: 'Arena',
                            id2: a._id,
                            times: 4
                        }, {
                            model1: 'Arena',
                            times: 1
                        }],
                        author: teacher.id
                    });
                });
                return [q, chs];
            }).spread(function(g, chs) {
                challenges = chs;
                quest = g;
                return [
                    quest.findOrAssign(student.id), User.findOne({
                        _id: teacher.id
                    }).exec(), User.findOne({
                        _id: student.id
                    }).exec()
                ];
            }).spread(function(uq, t, st) {
                uq.requirements.length.should.equal(5);
                teacher = t;
                student = st;
            }).finally(done);
        });
        afterEach(setup.clearDB);

        it('should update when a challenge is complete', function(done) {
            observer.once('requirement.complete', function(req) {
                req.id1.toString().should.equal(challenges[2].id);
                done();
            });
            ArenaTrial.create({
                user: student._id,
                arena: arena._id,
            }).then(function(at) {
                Trial.create({
                    challenge: challenges[2]._id,
                    complete: true,
                    user: student._id
                });
            });
        });

        it('should update when a challenge is complete', function(done) {
            var count = 0;
            var test = function(req) {
                count++;
                if (req.id2) {
                    observer.removeListener('requirement.complete', test);
                    done();
                }
            };
            observer.on('requirement.complete', test);
            ArenaTrial.create({
                user: student._id,
                arena: arena._id,
            }).then(function(at) {
                _.each(challenges, function(ch) {
                    Trial.create({
                        challenge: ch._id,
                        arenaTrial: at._id,
                        user: student._id,
                        complete: true
                    });

                });
            });
        });

        it('should update when an arena is complete', function(done) {
            var count = 0;
            var test = function(req) {
                                // console.log(req);

                if (req.model1 === 'Arena') {
                    count++;
                }
                if (count === 2) {
                    observer.removeListener('requirement.complete', test);
                    done();
                }
            };
            observer.on('requirement.complete', test);
            ArenaTrial.create({
                user: student._id,
                arena: arena._id,
            }).then(function(at) {
                _.each(challenges, function(ch) {
                    Trial.create({
                        challenge: ch._id,
                        arenaTrial: at._id,
                        user: student._id,
                        complete: true
                    });

                });
            });
        });

    });
});
