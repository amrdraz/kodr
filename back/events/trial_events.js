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
                }).populate('arenaTrial').exec();
            })
            .then(function(trial) {
                if (!trial) return Promise.resolve(true); // if challenge doesn't have any trials
                var arenaTrial = trial.arenaTrial;
                Trial.update({
                    challenge: challenge._id
                }, {
                    challenge: null,
                    arenaTrial: null
                }, {
                    multi: true
                }, function(err, numAffected) {
                    if (err) throw err;
                    Trial.find({
                        arenaTrial: arenaTrial._id
                    }).exec().then(function(trials) {
                        arenaTrial.trials = _.map(trials, '_id');
                        arenaTrial.save(function(err, at) {
                            //for testing
                            if(process.env.NODE_ENV ==='test') {
                                observer.emit('test.challenge.trials.removed', at.trials.length, challenge.trials.length);
                            }
                        });
                    });
                    // arenaTrial.trials = _.filter(arenaTrial.trials, function (id) {
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