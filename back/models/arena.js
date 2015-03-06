var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
var relationship = require("mongoose-relationship");


/**
 * Arena Schema.
 * An Arena is collection of challenges with a common goal
 * Users can grind inside arenas to gain experience points (exp) in a specific topic
 * To unlock an arean the user must meet some requirments expressed through achievments
 * Users are served a random order of challanges inside arenas, this is to reduce
 * the temptation of cheating under the pretext that you can not search for a specific challenge
 *
 * @type {mongoose.Schema}
 * @exports {mongoose.model}
 */

var ArenaSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    isPublished: {
        type:Boolean,
        default:false
    },
    requires: {
        type: [ObjectId], ref: 'Requirement'
    },
    fllow:  {
        type: String,
        default:'any',
        enum: ['any', 'sequencial']
    },
    challenges: [{
        type: ObjectId,
        ref: 'Challenge',
    }],
    trials: [{
        type: ObjectId,
        ref: 'Trial',
    }],
    author: {
        type: ObjectId,
        ref: 'User',
        childPath: "arenas"
    },
    users: [{
        type: ObjectId,
        ref: 'ArenaTrial'
    }]
});

ArenaSchema.plugin(relationship, {
    relationshipPathName: ['author']
});


ArenaSchema.plugin(require('../helpers/arena'), 'Arena');

module.exports = mongoose.model('Arena', ArenaSchema);
