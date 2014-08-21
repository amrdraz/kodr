var mongoose = require('mongoose');
var version = require('mongoose-version');
var relationship = require("mongoose-relationship");

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

var Challenge = new mongoose.Schema({
    name: {
        type: String,
        'default': 'New Challenge'
    },
    setup: {
        type: String,
        'default': '// Starting Code leave blank if you want Student to start from scrach\n'
    },
    preCode: {
        type: String,
        'default': '// Code that will run before the student\'s codeh\n'
    },
    postCode: {
        type: String,
        'default': '// Code that will run after the student\'s code, but not for testing h\n'
    },
    solution:  {
        type: String,
        'default': '// Challenge Solution goes here\n'
    },
    tests:  {
        type: String,
        'default': '// Challenge Tests go here\n'
    },
    description:  {
        type: String,
        'default': 'A new Challenge'
    },
    // the current state of a cahllenge
    status:  {
        type: String,
        'default': 'unPublished',        
        'enum': ['unPublished','Beta', 'Published']
    },
    isPublished:  {
        type: Boolean,
        'default': false
    },
    valid:  {
        type: Boolean,
        'default': false
    },
    exp: {
        type: Number,
        'default':1,
        min:1
    },
    author: {
        type: ObjectId, ref: 'User', childPath:"challenges"
    },
    arena: {
        type: ObjectId, ref: 'Arena', childPath:"challenges"
    },
    trials: {
        type: [ObjectId], ref: 'Trial'
    }
    
});

Challenge.plugin(version, { collection: 'ChallengeVersions', log:true });
Challenge.plugin(relationship, { relationshipPathName: ['arena', 'author']});

module.exports = mongoose.model('Challenge', Challenge);
