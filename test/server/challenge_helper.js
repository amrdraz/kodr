/*globals before,after,beforeEach,afterEach,describe,it */
var Promise = require('bluebird');
var _ = require('lodash');
var should = require('chai').should();
var expect = require('chai').expect;
var request = require('supertest');
var setup = require('./setup');

var Group = require('../../back/models/group');
var Challenge = require('../../back/models/challenge');
var Trial = require('../../back/models/trial');
var User = require('../../back/models/user');
var Arena = require('../../back/models/arena');
var observer = require('../../back/observer');

describe('Group Helper', function() {
    before(function(done) {
        return setup.clearDB(done);
    });

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
                Group.create({}),
                User.create(teacher),
                User.create(student),
                User.create(student2),
                Challenge.create({
                    exp: 4,
                }),
                Challenge.create({
                    exp: 4,
                })
            ];
        }).spread(function(g, t, st, st2, ch1, ch2) {
            group = g;
            teacher = t;
            student = st;
            student2 = st2;
            challenge = ch1;
            challenge2 = ch2;
        }).finally(done);
    });
    afterEach(setup.clearDB);

    it('should create challenges using KCreate', function(done) {
        Challenge.KCreate({}).then(function(ch) {
            should.exist(ch);
            done();
        }).catch(done);
    });

    it('should challenge update challenge order if using KCreate and challenge has arena', function(done) {
        Promise.fulfilled().then(function() {
            return Arena.create({});
        }).then(function(a) {
            return Challenge.KCreate({
                arena: a.id
            });
        }).then(function(ch) {
            should.exist(ch);
            done();
        }).catch(done);
    });

    it('shoud auto incriment order', function(done) {
        var arena;
        Promise.fulfilled().then(function() {
            return Arena.create({});
        }).then(function(a) {
            arena = a;
            return Challenge.KCreate({
                arena: arena.id
            });
        }).then(function(ch) {
            challenge = ch;
            challenge.order.should.equal(1);
            return Challenge.KCreate({
                arena: arena.id
            });
        }).then(function(ch) {
            ch.order.should.equal(2);
            done();
        }).catch(done);
    });

});
