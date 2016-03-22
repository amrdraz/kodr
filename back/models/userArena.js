var mongoose = require('mongoose');
var Promise = require('bluebird');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
var relationship = require("mongoose-relationship");
var observer = require('../observer');
var Challenge = require("./challenge");
var Trial = require("./trial");

/**
 * Arena User Schema.
 * This model holds information about user preformance inside a particular arena
 * alows us to form metrics such as how many challenges did he solve, experiance gained here
 * and anything related to user and arena
 *
 * @attribute exp           Number      The amount of experiance gained per challenge
 * @attribute complete      Boolean     Whether Arena was complete or not
 * @attribute completed     Number      number of trials completed
 * @attribute trials        [Trial]     The challenges the user tried in this arena
 * @attribute arena         Arean       The Arena the metrics is tracked for
 * @attribute user          User        The relevent user

 * @type {mongoose.Schema}
 * @exports {mongoose.model}
 */

var UserArenaSchema = new mongoose.Schema({
    exp: {
        type: Number,
        'default': 0,
        min: 0
    },
    complete: {
        type: Boolean,
        'default': false
    },
    completeTime: {
        type: Date
    },
    startTime: {
        type: Date
    },
    completed: {
        type: Number,
        'default': 0
    },
    trials: [{
        type: ObjectId,
        ref: 'Trial'
    }],
    arena: {
        type: ObjectId,
        ref: 'Arena',
        childPath: "users"
    },
    user: {
        type: ObjectId,
        ref: 'User',
        childPath: "userArenas"
    },
    locked: {
        type: Boolean,
        default: false
    },
    /*
    Prerequisit defines the arena that has to be unlocked before
    accessing this one. Could be null.
    */
    prerequisit: {
        type: ObjectId,
        ref: 'Arena'
    },

});

UserArenaSchema.plugin(relationship, {
    relationshipPathName: ['arena', 'user']
});

UserArenaSchema.plugin(require('../helpers/userArena_helper'), 'UserArena');


var UserArena = module.exports = mongoose.model('UserArena', UserArenaSchema);

require('../events/userArena_events').model(UserArena);