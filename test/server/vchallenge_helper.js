/*globals before,after,beforeEach,afterEach,describe,it */
var Promise = require('bluebird');
var _ = require('lodash');
var should = require('chai').should();
var expect = require('chai').expect;
var request = require('supertest');
var setup = require('./setup');

var Group = require('../../back/models/group');
var VChallenge = require('../../back/models/vchallenge');
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
        group, vchallenge, vchallenge2;
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
                VChallenge.create({
                    exp: 4,
                }),
                VChallenge.create({
                    exp: 4,
                })
            ];
        }).spread(function(g, t, st, st2, ch1, ch2) {
            group = g;
            teacher = t;
            student = st;
            student2 = st2;
            vchallenge = ch1;
            vchallenge2 = ch2;
        }).finally(done);
    });
    afterEach(setup.clearDB);

    it('should create vchallenges using KCreate', function(done) {
        VChallenge.KCreate({}).then(function(ch) {
            should.exist(ch);
            done();
        }).catch(done);
    });

    it('should vchallenge update vchallenge order if using KCreate and vchallenge has arena', function(done) {
        Promise.fulfilled().then(function() {
            return Arena.create({});
        }).then(function(a) {
            return VChallenge.KCreate({
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
            return VChallenge.KCreate({
                arena: arena.id
            });
        }).then(function(ch) {
            vchallenge = ch;
            vchallenge.order.should.equal(1);
            return VChallenge.KCreate({
                arena: arena.id
            });
        }).then(function(ch) {
            ch.order.should.equal(2);
            done();
        }).catch(done);
    });

});
