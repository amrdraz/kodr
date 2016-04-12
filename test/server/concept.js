/*globals before,after,beforeEach,afterEach,describe,it */
var Promise = require('bluebird');
var should = require('chai').should();
var assert = require('chai').assert;
var expect = require('chai').expect;
var request = require('supertest');
var setup = require('./setup');
var mongoose = require('mongoose');
var Arena = require('../../back/models/arena');
var UserArena = require('../../back/models/userArena');
var Challenge = require('../../back/models/challenge');
var User = require('../../back/models/user');
var Concept = require('../../back/models/concept');
var Trial = require('../../back/models/trial');
var _ = require('lodash');



describe('Concept', function() {
  before(function(done) {
    // setup.clearDB(done);
    done()
    
  });

  describe('Trials', function() {
    var concept, challenge, userArena, user, trials, num = 1;
    beforeEach(function(done) {
        Promise.fulfilled().then(function() {
            var at = UserArena.create({});
            var ch = Challenge.create({});
            var ch2 = Challenge.create({});
            usr = User.create({
                username: 'testuser',
                password: 'testuser12'
            });
            con1 = Concept.create({
              author: usr._id,
              name: 'Conditionals'
            });
            con2 = Concept.create({
              author: usr._id,
              name: 'Loop'
            });
            return [at, ch, ch2, usr, con1, con2];
        }).spread(function(at, ch, ch2, usr, con1, con2) {
            challenge = ch;
            userArena = at;
            user = usr;
            var list = [];
            var arr = Array(num);
            var chs = Promise.each(arr, function() {
                return Trial.create({
                    challenge: ch._id,
                    userArena: at._id,
                    user: usr,
                    concepts: [con1._id]
                }).then(function(trial) {

                  con1.trials.push(trial.id);
                });
            });
            var chs2 = Promise.each(arr, function() {
                return Trial.create({
                    challenge: ch2._id,
                    userArena: at._id,
                    user: usr,
                    concepts: [con1._id, con2._id]

                }).then(function(trial) {

                  con1.trials.push(trial.id);
                  con2.trials.push(trial.id);
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

    it('should create a concept with max_exp', function(done) {
      // max_exp is automatically filled
      Promise.fulfilled().then(function() {
        return Concept.findOrCreate({
                  name: 'Concept'
                })
      }).then(function(concept) {
        concept.max_exp.should.equal(10);
        done();
      });
    });

    it('should return trials having only 1 concept', function(done) {
      
      usr.then(function(user) {
        con1.then(function(concept) {
          Promise.fulfilled().then(function() {
            return Concept.findTrialsWithConcept(concept, user, true);
          }).then(function(trials) {
            trials.length.should.equal(num);
            done();
          })
        });
      });
      
    });

    it('should return trials having this concept', function(done) {
      usr.then(function(user) {
        con1.then(function(concept) {
          Promise.fulfilled().then(function() {
            return Concept.findTrialsWithConcept(concept, user, false);
          }).then(function(trials) {
            trials.length.should.equal(num*2);
            done();
          })
        });
      });
    });

    it('should remove concept from trials', function(done) {
      usr.then(function(user) {
        con1.then(function(concept) {
          Promise.fulfilled().then(function() {
            return concept.removeConceptFromTrials();
          }).then(function(trials) {
            
            Trial.find({}).exec().then(function(trials) {
              _.map(trials, function(trial){
                console.log(trial.concepts.length);
              });
            });
            done();
          });
        });
      });

    });

  });

});
