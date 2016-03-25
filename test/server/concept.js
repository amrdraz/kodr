/*globals before,after,beforeEach,afterEach,describe,it */
var Promise = require('bluebird');
var should = require('chai').should();
var assert = require('chai').assert;
var expect = require('chai').expect;
var request = require('supertest');
var setup = require('./setup');
var Arena = require('../../back/models/arena');
var Challenge = require('../../back/models/challenge');
var User = require('../../back/models/user');



describe('Concept', function() {
  before(function(done) {
    return setup.clearDB(done);
  });

  describe('Challenges', function() {
    var concept, challenge, userArena, user, num = 10;
    beforeEach(function(done) {
      Promise.fulfilled().then(function() {
        var at = userArena.create({});
        var ch = Challenge.create({});
        var ch2 = Challenge.create({});
        var usr = User.create({
            username: 'testuser',
            password: 'testuser12'
        });
        return [at, ch, ch2, usr];
      }).spread(function(at, ch, ch2, usr) {
        challenge = ch;
        userArena = at;
        user = usr;
        var arr = Array(num);
        var chs = Promise.each(arr, function() {
          return Trial.create({
            challenge: ch._id,
            userArena: at._id,
            user: usr
          });
        });

        var chs2 = Promise.each(arr, function() {
          return Trial.create({
            challenge: ch2._id,
            userArena: at._id,
            user: usr
          });
        });

        return [chs, chs2];
      }).spread(function(chs, chs2) {
        trials = chs.concat(chs2);
        return [
          UserArena.findOne({
            _id: userArena._id
          }).exec(),
          Challenge.findOne({
            _id: challenge._id
          }).exec()
        ];
      }).spread(function(at, ch) {
        userArena = at;
        challenge = ch;
      }).finally(done);
    });
    afterEach(setup.clearDB);

    



  })

})
