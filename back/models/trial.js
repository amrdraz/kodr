var mongoose = require('mongoose');
var Promise = require('bluebird');
var util = require('util');
var version = require('mongoose-version');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
var relationship = require("mongoose-relationship");
var observer = require('../mediator');


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
        // required: true
    },
    user: {
        type: ObjectId,
        ref: 'User',
        childPath: "trials"
    },
    arenaTrial: {
        type: ObjectId,
        ref: 'ArenaTrial',
        childPath: "trials"
    }

});

TrialSchema.plugin(version, {
    collection: 'TrialVersions',
    logError: true,
    suppressVersionIncrement: false,
    ignorePaths: ['times', 'exp', 'user', 'arenaTrial'],
    strategy: 'array'
});

TrialSchema.plugin(relationship, {
    relationshipPathName: ['arenaTrial', 'user']
});

TrialSchema.pre('save', true, function(next, done) {
    next(null, this);
    if (this.complete) {
        this.completed++;
        if (this.completed === 1) {
            return this.populate('challenge', function(err, trial) {
                if (err) done(err);
                trial.exp = trial.challenge.exp;
                done(null, trial);
            });
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
    return Promise.fulfilled().then(function() {
        return Trial.findOne({
            user: trial.user,
            challenge: trial.challenge
        }).exec();
    }).then(function(model) {
        if (model) return model;
        return Trial.create(trial).then(function(model) {
            return model;
        });
    });
};


function computeResult(trial, done) {

}

var Trial = mongoose.model('Trial', TrialSchema);


module.exports = Trial;
