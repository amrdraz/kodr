var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
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

var ActivitySchema = new mongoose.Schema({
    subjectModel: String,
    subjectId: ObjectId,
    verb: {
        type: String,
        // 'enum': ['signedout','signedin','signedup','activated','verified','created', 'updated', 'deleted', 'viewed','started', 'tried', 'gained', 'posted','joined', 'completed', 'awarded']
    },
    action: String,
    objectModel: String,
    objectId: ObjectId,
    objectMeta:Mixed,
    time: {
        type:Date,
        default: Date.now
    }
});

ActivitySchema.plugin(require('../helpers/activity_helper'), 'Activity');

module.exports = mongoose.model('Activity', ActivitySchema);
