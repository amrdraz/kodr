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
    before(setup.clearDB);

    afterEach(setup.clearDB);

    it('should get challenges belonging to an arean', function(done) {
        var arena;
        Promise.fulfilled().then(function() {
            return Arena.create({});
        }).then(function(a) {
            arena = a;
            return Arena.getByIdChallenges(arena.id);
        }).then(function(chs) {
            chs.length.should.equal(0);
            return Challenge.KCreate({
                arena: arena.id
            });
        }).then(function(ch) {
            return Arena.getByIdChallenges(arena.id);
        }).then(function(chs) {
            chs.length.should.equal(1);
            done();
        }).catch(done);
    });

    it('should get challenges belonging to an arean', function(done) {
        var arena;
        Promise.fulfilled().then(function() {
            return Arena.create({});
        }).then(function(a) {
            arena = a;
            return Challenge.KCreate({
                arena: arena.id
            });
        }).then(function(ch) {
            return Arena.getByIdWithChallanges(arena.id);
        }).spread(function(a,chs) {
            chs.length.should.equal(1);
            should.exist(a);
            done();
        }).catch(done);
    });

});
