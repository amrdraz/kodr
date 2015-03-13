var mongoose = require('mongoose');
var Promise = require('bluebird');
var version = require('mongoose-version');
var relationship = require("mongoose-relationship");
var observer = require('../observer');

var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;

/**
 * VChallenge Schema.
 * A VChallenge is a means of testing and awarding users experience points for them
 * to reach achievements marking thier mastery of a subject
 * It has versions for users to undo edits etc (not really used yet)
 *
 * @type {mongoose.Schema}
 */

var VChallengeSchema = new mongoose.Schema({
    name: {
        type: String,
        'default': 'New VChallenge'
    },
    language: {
        type: String,
        'default': 'java',
        enum: ['javascript', 'java', 'python']
    },
    inputs: [String],
    setup: {
        type: String,
        'default': '// Starting Code leave blank if you want Student to start from scratch\n'
    },
    solution: {
        type: String,
        'default': '// VChallenge Solution goes here\n'
    },
    tests: {
        type: String,
        'default': '// VChallenge Tests go here\n'
    },
    description: {
        type: String,
        'default': 'A new VChallenge'
    },
    // the current state of a cahllenge
    status: {
        type: String,
        'default': 'unPublished',
        'enum': ['unPublished', 'Beta', 'Published']
    },
    isPublished: {
        type: Boolean,
        'default': false
    },
    valid: {
        type: Boolean,
        'default': false
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
    author: {
        type: ObjectId,
        ref: 'User',
        childPath: "vchallenges"
    },
    arena: {
        type: ObjectId,
        ref: 'Arena',
        childPath: "vchallenges"
    },
    trials: [{
        type: ObjectId,
        ref: 'Trial'
    }]

});

VChallengeSchema.plugin(version, {
    collection: 'VChallengeVersions',
    log: true
});
VChallengeSchema.plugin(relationship, {
    relationshipPathName: ['arena', 'author']
});

VChallengeSchema.plugin(require('../helpers/vchallenge'), 'VChallenge');

VChallengeSchema.post('remove', function(doc) {
    observer.emit('vchallenge.removed', doc);
});

var VChallenge = module.exports = mongoose.model('VChallenge', VChallengeSchema);

require('../events/vchallenge').model(VChallenge);