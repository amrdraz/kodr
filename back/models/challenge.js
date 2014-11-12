var mongoose = require('mongoose');
var Promise = require('bluebird');
var version = require('mongoose-version');
var relationship = require("mongoose-relationship");
var relationship = require("mongoose-relationship");
var observer = require('../mediator');
var javaRunner = require('java-code-runner');

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
    language: {
        type: String,
        'default': 'java',
        enum: ['javascript', 'java', 'python']
    },
    setup: {
        type: String,
        'default': '// Starting Code leave blank if you want Student to start from scratch\n'
    },
    preCode: {
        type: String,
        'default': '// Code that will run before the student\'s code\n'
    },
    postCode: {
        type: String,
        'default': '// Code that will run after the student\'s code, but not for testing\n'
    },
    solution: {
        type: String,
        'default': '// Challenge Solution goes here\n'
    },
    tests: {
        type: String,
        'default': '// Challenge Tests go here\n'
    },
    description: {
        type: String,
        'default': 'A new Challenge'
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
        min: 1
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

ChallengeSchema.plugin(version, {
    collection: 'ChallengeVersions',
    log: true
});
ChallengeSchema.plugin(relationship, {
    relationshipPathName: ['arena', 'author']
});

ChallengeSchema.post('remove', function(doc) {
    observer.emit('challenge.removed', doc);
});

ChallengeSchema.methods.run = function(code) {
    return Challenge.run(code,this.language);
};

ChallengeSchema.statics.run = function(code, language) {
    return new Promise(function(resolve, reject) {
        switch (language) {
            case 'javascript':
                resolve(['no server js','']);
                break;
            case 'java':
                javaRunner.run(code,function (err,stout,sterr) {
                    if(err && !sterr) return reject(err);
                    return resolve([sterr, stout]);
                });
                break;
            case 'python':
                break;
            case 'ruby':
                break;
        }
    });
};


ChallengeSchema.methods.test = function(code) {
    return Challenge.test(code,this);
};

ChallengeSchema.statics.test = function(code, challenge) {
    return new Promise(function(resolve, reject) {
        switch (challenge.language) {
            case 'javascript':
                resolve(['no server js','']);
                break;
            case 'java':
                javaRunner.test(code,challenge.tests,challenge,function (err,report,stout,sterr) {
                    if(err && !sterr) return reject(err);
                    return resolve([report,stout, sterr]);
                });
                break;
            case 'python':
                break;
            case 'ruby':
                break;
        }
    });
};

var Challenge = module.exports = mongoose.model('Challenge', ChallengeSchema);
