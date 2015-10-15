var mongoose = require('mongoose');
var Promise = require('bluebird');
var relationship = require("mongoose-relationship");
var observer = require('../observer');

var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;

/**
 * Challenge Schema.
 * A Challenge is a means of testing and awarding users experience points for them
 * to reach achievements marking thier mastery of a subject
 * It has versions for users to undo edits etc (not really used yet)
 *
 * @type {mongoose.Schema}
 */

var ChallengeSchema = new mongoose.Schema({
    name: {
        type: String,
        'default': 'New Challenge'
    },
    type: {
        type: String,
        'default': 'python',
    },
    // blueprint: [{name:String, type:String}],
    blueprint: {
        type: Mixed,
        default: {
            language: 'python',
            setup: '',
            solution: '',
            tests: '',
            description: '',
        }
    },
    exp: {
        type: Number,
        'default': 1,
        min: 0
    },
    order: {
        type: Number,
        'default': 0,
        min: 0
    },
    group: {
        type: String,
        'default': null,
    },
    flags: {
        type: Mixed,
        default: {
            beta: true
        }
    },
    isPublished: {
        type: Boolean,
        'default': false
    },
    valid: {
        type: Boolean,
        'default': false
    },
    author: {
        type: ObjectId,
        ref: 'User',
        childPath: "challenges"
    },
    arena: {
        type: ObjectId,
        ref: 'Arena',
        childPath: "challenges"
    },
    trials: [{
        type: ObjectId,
        ref: 'Trial'
    }]

});

// ChallengeSchema.plugin(version, {
//     collection: 'ChallengeVersions',
//     log: true
// });
ChallengeSchema.plugin(relationship, {
    relationshipPathName: ['arena', 'author']
});

ChallengeSchema.plugin(require('../helpers/challenge'), 'Challenge');

ChallengeSchema.post('remove', function(doc) {
    observer.emit('challenge.removed', doc);
});

var Challenge = module.exports = mongoose.model('Challenge', ChallengeSchema);

require('../events/challenge').model(Challenge);
