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
var UserConcept = require('../../back/models/userConcept');
var Suggestion = require('../../back/models/suggestion');
var _ = require('lodash');



describe('UserConcept', function() {
  before(function(done) {
    // setup.clearDB(done);
    done()
    
  });

  describe('Trials', function() {
    var concept, challenge, userArena, user, trials, suggestion, num = 1;
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
              exp: 10,
              x: 1.0,
              slope:0.25
            });

            
            return [at, ch, ch2, usr, con1, con2, usrCon, usrCon2];
        }).spread(function(at, ch, ch2, usr, con1, con2, usrCon, usrCon2) {
            challenge = ch;
            userArena = at;
            user = usr;
            var list = [];
            var arr = Array(num);
            suggestion = Suggestion.create({
              user_concept: usrCon2._id,
              user: usr._id,
              times_resolved: 1
            });
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

            return [chs, chs2, suggestion];
        }).spread(function(chs, chs2, sugg) {
          suggestion = sugg;
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

    it('should increment exp if it is less than max_exp', function(done) {
      usrCon.then(function(userCon) {
        // usrCon is the variable defined in beforeEach, we have to use
        // .then so we can extract the record from the Promise
        UserConcept.findOne({
          _id: userCon._id
        }).exec().then(function(oldU){   
          var old_exp = oldU.exp;
          userCon.IncExp().then(function(report) {  
            UserConcept.findOne({
              _id: userCon._id
            }).exec().then(function(newU){
              var new_exp = newU.exp;
              new_exp.should.equal(old_exp + 1);
            });
            done();
          });
        });        
      });
    });

    it('should not increment exp if it is equal to max_exp', function(done) {
      usrCon2.then(function(userCon) {
        // usrCon2 is the variable defined in beforeEach, we have to use
        // .then so we can extract the record from the Promise
        UserConcept.findOne({
          _id: userCon._id
        }).exec().then(function(oldU){   
          var old_exp = oldU.exp; 
          userCon.IncExp().then(function(report) {
            UserConcept.findOne({
              _id: userCon._id
            }).exec().then(function(newU){
              var new_exp = newU.exp;
              new_exp.should.equal(old_exp);
              done();
            });
          });
        });        
      });
    });

    it('should decrease slope', function(done) {
      usrCon.then(function(userCon) {
        userCon.decreaseSlope().then(function(h) {
          UserConcept.findOne({
            _id: userCon._id
          }).then(function(u) {
            u.slope.should.equal(0.5);
            done();
          });        
        }); 
      });
    });

    it('should not decrease slope beyond 0.125', function(done) {
      usrCon.then(function(userCon) {
        userCon.decreaseSlope().then(function(h) {
          UserConcept.findOne({
            _id: userCon._id
          }).then(function(u) {
            u.decreaseSlope().then(function(h) {
              UserConcept.findOne({
                _id: userCon._id
              }).then(function(u) {
                u.decreaseSlope().then(function(h) {
                  UserConcept.findOne({
                    _id: userCon._id
                  }).then(function(u) {
                    UserConcept.findOne({
                      _id: userCon._id
                    }).then(function(u) {
                      u.decreaseSlope().then(function(h) {
                        UserConcept.findOne({
                          _id: userCon._id
                        }).then(function(u) {
                          u.slope.should.equal(0.125);
                          done();
                        });
                      });
                    });  
                  });
                });
              });
            });
          });
          
        }); 
      });
    });

    it('should reset Slope and x if x = 1.0', function(done) {
      usrCon2.then(function(userCon) {
        userCon.resetSlope().then(function(h) {
          UserConcept.findOne({
            _id: userCon._id
          }).then(function(u) {
            u.x.should.equal(0);
            u.slope.should.equal(1);
            done();
          });
        });
      });
    });

    it('should update x with slope', function(done) {
      usrCon.then(function(userCon) {
        userCon.decreaseSlope().then(function(h) {
          UserConcept.findOne({
            _id: userCon._id
          }).then(function(u) {
            u.addSlopeToX().then(function(h) {
              UserConcept.findOne({
                _id: userCon._id
              }).then(function(u) {
                u.x.should.equal(0.5);
                done();
              });
            });
          });
        });
      });
    });

    it('should resolve suggestion after reset', function(done) {
      usrCon2.then(function(userCon) {
        userCon.resetSlope().then(function(h) {
          UserConcept.findOne({
            _id: userCon._id
          }).then(function(u) {
            Suggestion.findOne({
              _id: suggestion._id
            }).then(function(sugg) {
              sugg.solved.should.equal(true);
              done();
            });
          });
        });
      });
    });

  });

});
