var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var Mixed = mongoose.Schema.Mixed;

/**
 * Activity Schema.
 * The Activity tracks user actions on the system, which achivments can be awarded for
 * actions follow the format
 *     user `passed` challenge
 *     user `tried` challenge
 *     user `gained` exp from challenge in arena
 *     user `posted` on discussion
 *     user `posted` on comment
 * 
 * @type {mongoose.Schema}
 */

var Activity = new mongoose.Schema({
    action: {
        type: String,
        'enum': ['created','started', 'passed', 'tried', 'gained', 'posted']
    },
    exp: {
        type:Number,
        min:0
    },
    challenge: {
        type: ObjectId, ref: 'Challenge'
    },
    arena: {
        type: ObjectId, ref: 'Arena'
    },
    user: {
        type: ObjectId, ref: 'User'
    },
    
});

module.exports = mongoose.model('Activity', Activity);
