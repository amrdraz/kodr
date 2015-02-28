var Promise = require('bluebird');
var mongoose = require('mongoose');
var _ = require('lodash');
var observer = require('../observer');

module.exports = exports = function lastModifiedPlugin(schema, options) {
    var Model  = options.model || options;
    schema.plugin(require('./_common_helper'), options);

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
        var ArenaTrial = mongoose.model('ArenaTrial');

        var promise = Promise.fulfilled().then(function() {
            return Trial.findOne({
                user: trial.user,
                challenge: trial.challenge
            }).exec();
        }).then(function(model) {
            if (model) return model; // foudn model

            if (trial.arena && trial.arenaTrial) {
                delete trial.tests; // sometimes a tests filed is submited, it is not known whther this has any significance, shoudl probably remove this line
                return Trial.create(trial);
            } else {
                var tpromise = Promise.fulfilled().then(function() {
                    return Challenge.findOne({
                        _id: trial.challenge
                    }).exec();
                }).then(function(challenge) {
                    if (!challenge) throw new Error(403);
                    trial.arena = challenge.arena.toString();
                    trial.code = challenge.setup;
                    return challenge;
                });
                // console.log("trial.arenaTrial", trial.arenaTrial);
                if (trial.arenaTrial) {
                    return tpromise.then(function(challenge) {
                        return Trial.findOrCreate(trial);
                    });
                } else {
                    return tpromise.then(function(challenge) {
                        return ArenaTrial.findOrCreate({
                            arena: challenge.arena,
                            user: trial.user
                        }, true);
                    }).spread(function(at) {
                        trial.arenaTrial = at.id;
                        // console.log("trial findOrCreate",trial);
                        return Trial.findOrCreate(trial);
                    });
                }
            }
        });

        return promise;
    };
};
