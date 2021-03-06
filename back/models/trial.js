var mongoose = require('mongoose');
var Promise = require('bluebird');
var util = require('util');
var relationship = require("mongoose-relationship");
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
// var UserArena = require('./userArena'); // used bellow in findOrCreate to avoid circulare reference


/**
 * Trial Schema.
 * A trial is a users attempt on a challenge, most fileds are a replica of the original challenge
 * versions of the trial are maintained for analysing the user's preformance
 * experiance is tipically granted on completion but would be intresting if the challenge awards exp in  adifferent way
 *
 * @attribute work      Mixed       Users's wrok in this trial
 * @attribute exp       Number      the experiance he gained in this trial
 * @attribute completed Boolean     Whether the user passes or not
 * @attribute report    Mixed       The result of the tests run on the code
 * @attribute challenge Challenge   The Challenge the trial is on
 * @attribute user      User        The User trying the challenge
 *
 * @type {mongoose.Schema}
 */

var TrialSchema = new mongoose.Schema({
    work: {
        type:Mixed,
        default:{}
    },
    blueprint: {
        type:Mixed,
        default:{}
    },
    exp: {
        type: Number,
        'default': 0
    },
    order: {
        type: Number,
        'default': 0
    },
    group: {
        type: String,
        'default': null
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

    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },

    activities: [{
        type: ObjectId,
        ref: 'Activity',
    }],
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
    userArena: {
        type: ObjectId,
        ref: 'UserArena',
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

// TrialSchema.plugin(version, {
//     collection: 'TrialVersions',
//     logError: true,
//     suppressVersionIncrement: false,
//     ignorePaths: ['times', 'exp', 'user', 'userArena', 'challenge', 'arena', 'order'],
//     strategy: 'array'
// });

TrialSchema.plugin(relationship, {
    relationshipPathName: ['userArena', 'user', 'challenge', 'arena']
});


TrialSchema.plugin(require('../helpers/trial_helper'), 'Trial');

var Trial = module.exports = mongoose.model('Trial', TrialSchema);

require('../events/trial_events').model(Trial);
