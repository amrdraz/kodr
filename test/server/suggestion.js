/*globals before,after,beforeEach,afterEach,describe,it */
var Promise = require('bluebird');
var should = require('chai').should();
var assert = require('chai').assert;
var expect = require('chai').expect;
var request = require('supertest');
var setup = require('./setup');
var mongoose = require('mongoose');
var observer = require('../../back/observer');
var Arena = require('../../back/models/arena');
var UserArena = require('../../back/models/userArena');
var Challenge = require('../../back/models/challenge');
var User = require('../../back/models/user');
var Concept = require('../../back/models/concept');
var Trial = require('../../back/models/trial');
var UserConcept = require('../../back/models/userConcept');
var Suggestion = require('../../back/models/suggestion');
var _ = require('lodash');
var sinon = require('sinon');



describe('Suggestion', function() {
  before(function(done) {
    // setup.clearDB(done);
    done()
    
  });

  describe('Trials', function() {
    require('../../back/events/userConcept_events');
    var challenge, userArena, user, trials, num = 1;
    var suggestion, userConcept, concept, concept2, userConcept2;
    beforeEach(function(done) {
        Promise.fulfilled().then(function() {
            var at = UserArena.create({});
            var ch = Challenge.create({});
            var ch2 = Challenge.create({});
            // var con1, con2, usrCon;
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
              name: 'Loops'
            });
            usrCon = UserConcept.create({
              concept: con2._id,
              user: usr._id
            });
            usrCon2 = UserConcept.create({
              concept: con2._id,
              user: usr._id,
              exp: 10
            });
            sugg = Suggestion.create({
              user_concept: usrCon._id,
              user: usr._id,

            });

            
            return [at, ch, ch2, usr, con1, con2, usrCon];
        }).spread(function(at, ch, ch2, usr, con1, con2, usrCon) {
            challenge = ch;
            userArena = at;
            user = usr;
            concept = Concept.create({
              author: usr._id,
              name: 'Nested Loops'
            });
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
                  Concept.update({
                    _id: con1._id
                  }, {
                    trials: [trial._id]
                  }).exec();

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
                  var t = con1.trials;

                  Concept.update({
                    _id: con1._id
                  }, {
                    trials: t
                  }).exec();
                  Concept.update({
                    _id: con2._id
                  }, {
                    trials: [trial.id]
                  }).exec();
                  
                });
            });

            return [chs, chs2, concept, con1];
        }).spread(function(chs, chs2, con, con1) {
            concept = con;
            concept2 = con1;
            userConcept = UserConcept.create({
              concept: concept2._id,
              user: user._id,
              slope: 0.5
            }).then(function(uc) {
              userConcept = uc;
              suggestion = Suggestion.create({
                user_concept: userConcept,
                user: user._id
              }).then(function(s) {
                suggestion = s;
              });
            });

            UserConcept.create({
              concept: con._id,
              user: user._id
            }).then(function(uc) {
              userConcept2 = uc;
            });
            
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

    it('should get trials for a suggestion', function(done) {

      Promise.fulfilled().then(function() {
        return suggestion.getTrialsForSuggestion();
      }).then(function(trials) {
        trials.length.should.equal(num);
        done();
      });

    });


    it('should increment suggestion', function(done) {
      var old_suggested_times = suggestion.times_suggested;
      Suggestion.createOrIncrementSuggestion(userConcept).then(function() {
        Suggestion.findOne({
          _id: suggestion._id
        }).then(function(s) {
          s.times_suggested.should.equal(old_suggested_times + 1);
          done();
        });
      });
    });

    it('should create suggestion', function(done) {
      Suggestion.createOrIncrementSuggestion(userConcept2).then(function(s) {
        s.times_suggested.should.equal(1);
        done();
      });
    });

    it('should decrease slope after creating suggestion', function(done) {
      Suggestion.createOrIncrementSuggestion(userConcept2).then(function(s) {
        UserConcept.findOne({
          _id: userConcept2._id
        }).exec().then(function(uc) {
          uc.slope.should.equal(0.5);
          done();
        });
      });
    });

    it('should decrease slope after incrementing suggestion', function(done) {
      Suggestion.createOrIncrementSuggestion(userConcept).then(function(s) {
        UserConcept.findOne({
          _id: userConcept._id
        }).exec().then(function(uc) {
          uc.slope.should.equal(0.25);
          done();
        });
      });
    });

    it('should get unsolved suggestions for a user', function(done) {
      Suggestion.getUnsolvedSuggestions(user).then(function(suggestions) {
        suggestions.length.should.equal(1);
        done();
      });
    });

    it('should resolve a suggestion', function(done) {
      suggestion.resolve().then(function() {
        Suggestion.findOne({
          _id: suggestion._id
        }).then(function(sugg) {
          sugg.dates_resolved.length.should.equal(1);
          sugg.solved.should.equal(true);
          sugg.times_resolved.should.equal(1);
          done();
        }); 
      });
    });

    it('should add slope to X after resolving suggestion', function(done) {
      suggestion.resolve().then(function() {
        Suggestion.findOne({
          _id: suggestion._id
        }).then(function(sugg) {
          UserConcept.findOne({
            _id: userConcept._id
          }).exec().then(function(uc) {
            uc.x.should.equal(0.5);
            console.log(sugg)
            done();
          }); 
        }); 
      });
    });

    // it('should emit', function(done) {
    //   observer.on('test.test', function(string) {
    //     console.log(string);
    //   });
    //   observer.emit('test.test', 'ok');
    //   observer.emit('suggestion.generateOrIncrement');
    //   done();
    // });

  });

});
