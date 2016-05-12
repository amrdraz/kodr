var Promise = require('bluebird');
var mongoose = require('mongoose');
var _ = require('lodash');
var observer = require('../observer');
var captainHook  = require('captain-hook');
var Concept = require('../models/concept');

module.exports = exports = function lastModifiedPlugin(schema, options) {
    var Model = options.model || options;
    schema.plugin(require('./_common_helper'), options);
    schema.plugin(captainHook);

    // function to run after saving a new trial instance 
    schema.postCreate(function(trial, next){
      /*

      */
      var Challenge = mongoose.model('Challenge');
      var Concept = mongoose.model('Concept');
      var Trial = mongoose.model('Trial');
      Challenge.findOne({
        _id: trial.challenge
      }).then(function(challenge) {
        Trial.update({
            _id: trial._id
        }, {
            concepts: challenge.concepts
        }).exec().then(function(h) {
            _.map(challenge.concepts, function(cid) {
                Concept.findOne({
                    _id: cid
                }).then(function(concept) {
                    var conTrials = concept.trials;
                    conTrials.push(trial._id);
                    Concept.update({
                        _id: cid
                    }, {
                        trials: conTrials
                    }).exec();
                });
            });
        });
        
      });
      next();
    });

    schema.pre('save', true, function(next, done) {
        var Challenge = mongoose.model('Challenge');
        next(null, this);
        if (this.complete) {
            this.completed++;
            if (this.completed === 1) {
                var trial = this;
                return Challenge.findOne({
                    _id: this.challenge
                }).exec().then(function(challenge) {
                    trial.exp = challenge.exp;
                    done(null, trial);
                }, done);
            }
        }
        // next(null, this);
        done(null, this);
    });

    schema.post('save', function(doc) {
        // util.log(doc);
        if (doc.complete) {
            // util.log('completed doc');
            if (doc.completed === 1) {
                // util.log('completed for frst time award user exp '+doc.exp);
                observer.emit('trial.award', doc);
            }
            observer.emit('trial.complete', doc);
        }
    });

    schema.statics.findOrCreate = function(trial) {
        // console.log('trial create',trial);
        var Trial = mongoose.model('Trial');
        var Challenge = mongoose.model('Challenge');
        var UserArena = mongoose.model('UserArena');

        if (trial.arena && trial.userArena) {
            return Trial.getOneByQueryOrCreate({
                user: trial.user,
                challenge: trial.challenge
            }, trial);
        }

        //get challenge
        var promise = Challenge.getById_404(trial.challenge).then(function(challenge) {
            trial.arena = challenge.arena;
            trial.code = challenge.setup;
            return challenge;
        });

        if (trial.userArena) {
            return promise.then(function(challenge) {
                return Trial.findOrCreate(trial);
            });
        } else {
            return promise.then(function(challenge) {
                var userArena = {
                    arena: challenge.arena,
                    user: trial.user
                };
                return UserArena.getOneByQueryOrCreate(userArena,userArena);
            }).then(function(at) {
                trial.userArena = at.id;
                // console.log("trial findOrCreate",trial);
                return Trial.findOrCreate(trial);
            });
        }


        return promise;
    };
};
