var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('lodash');
var util = require('util');
var version = require('mongoose-version');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
var relationship = require("mongoose-relationship");
var observer = require('../mediator');
var Challenge = require('./challenge');
// var ArenaTrial = require('./arenaTrial'); // used bellow in findOrCreate to avoid circulare reference


/**
 * Trial Schema.
 * A trial is a users attempt on a challenge
 * versions of the trial are maintained for analysing the user's preformance
 * experiance is tipically granted on completion but would be intresting if the challenge awards exp in  adifferent way
 *
 * @attribute code      String      Users's code submittion
 * @attribute exp       Number      the experiance he gained in this trial
 * @attribute completed Boolean     Whether the user passes or not
 * @attribute report    Mixed       The result of the tests run on the code
 * @attribute challenge Challenge   The Challenge the trial is on
 * @attribute user      User        The User trying the challenge
 *
 * @type {mongoose.Schema}
 */

var TrialSchema = new mongoose.Schema({
    code: {
        type: String,
    },
    times: {
        type: Number,
        'default': 0
    },
    exp: {
        type: Number,
        'default': 0
    },
    started: {
        type: Boolean,
        'default': false
    },
    complete: {
        type: Boolean,
        'default': false
    },
    completed: {
        type: Number,
        'default': 0
    },
    report: Mixed,
    time: {
        type: Date,
        'default': Date.now
    },
    challenge: {
        type: ObjectId,
        ref: 'Challenge',
        childPath: "trials",
        // required: true
    },
    user: {
        type: ObjectId,
        ref: 'User',
        childPath: "trials",
        // required: true,
    },
    arenaTrial: {
        type: ObjectId,
        ref: 'ArenaTrial',
        childPath: "trials",
        // required: true
    },
    arena: {
        type: ObjectId,
        ref: 'Arena',
        childPath: "trials",
        // required: true
    }

});

TrialSchema.plugin(version, {
    collection: 'TrialVersions',
    logError: true,
    suppressVersionIncrement: false,
    ignorePaths: ['times', 'exp', 'user', 'arenaTrial', 'challenge', 'arena'],
    strategy: 'array'
});

TrialSchema.plugin(relationship, {
    relationshipPathName: ['arenaTrial', 'user', 'challenge', 'arena']
});

TrialSchema.pre('save', true, function(next, done) {
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

TrialSchema.post('save', function(doc) {
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

TrialSchema.statics.findOrCreate = function(trial) {
    // console.log('trial create',trial);
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
                    return require("./arenaTrial").findOrCreate({
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


function computeResult(trial, done) {

}

var Trial = module.exports = mongoose.model('Trial', TrialSchema);

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
                        observer.emit('test.challenge.trials.removed', at.trials.length, challenge.trials.length);
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
