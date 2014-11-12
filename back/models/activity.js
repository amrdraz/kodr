var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;
var Mixed = mongoose.Schema.Mixed;
var relationship = require("mongoose-relationship");

/**
 * Activity Schema.
 * The Activity tracks user actions on the system, a sort of logging
 * @param {User} subject the person who made acted
 * @param {String} action the action inacted by the subject, actions follow the format
 *     user `passed` challenge
 *     user `tried` challenge
 *     user `gained` exp from challenge in arena
 *     user `posted` on discussion
 *     user `posted` on comment
 * @param {Sting} object object that was acted upon
 * @param {ObjectId} objectId The refrence to the object
 * @type {mongoose.Schema}
 */

var Activity = new mongoose.Schema({
    subject:{
        type:ObjectId,
        ref:'User',
        childPath: "activities"
    },
    action: {
        type: String,
        'enum': ['signedout','signedin','signedup','activated','created', 'updated', 'deleted', 'viewed','started', 'completed', 'tried', 'gained', 'posted', 'completed', 'awarded']
    },
    object: String,
    objectId: ObjectId,
    time: {
        type:Date,
        default: Date.now
    }
});

Activity.plugin(relationship, {
    relationshipPathName: ['subject']
});

module.exports = mongoose.model('Activity', Activity);
