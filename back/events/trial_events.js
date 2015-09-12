var _ = require('lodash');
var Promise = require('bluebird');
var observer = require('../observer');
var util = require('util');

exports.model = function (Trial) {
  // removing trial from arena trial so that it wouldn't show up
    // while still retaining the data for the user's histroy (tho maybe that's not a good idea)
    observer.on('challenge.removed', function(challenge) {
        Promise.fulfilled()
            .then(function() {
                return Trial.findOne({
                    challenge: challenge._id
                }).populate('userArena').exec();
            })
            .then(function(trial) {
                if (!trial) return Promise.resolve(true); // if challenge doesn't have any trials
                var userArena = trial.userArena;
                Trial.update({
                    challenge: challenge._id
                }, {
                    challenge: null,
                    userArena: null
                }, {
                    multi: true
                }, function(err, numAffected) {
                    if (err) throw err;
                    Trial.find({
                        userArena: userArena._id
                    }).exec().then(function(trials) {
                        userArena.trials = _.map(trials, '_id');
                        userArena.save(function(err, at) {
                            //for testing
                            if(process.env.NODE_ENV ==='test') {
                                observer.emit('test.challenge.trials.removed', at.trials.length, challenge.trials.length);
                            }
                        });
                    });
                    // userArena.trials = _.filter(userArena.trials, function (id) {
                    //     return _.remove(challenge.trials, function (oid) {
                    //         return oid.equals(id);
                    //     });
                    // },[]);

                });
            }).catch(function(err) {
                util.error(err);
            });

    });
};