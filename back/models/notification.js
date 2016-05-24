var mongoose = require('mongoose');
var observer = require('../observer');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;

/**
 * Notification Schema.
 *
 * @attribute actor         [ObjectId]      the user who made the action
 * @attribute reciever      [ObjectId]      the user who recieves the action
 * @attribute post          [ObjectId]      the post id that the action was made on
 * @attribute question      [ObjectId]      the question id that the action was made on
 * @attribute verb          String          commented/ answered/ votedUp/ votedDown
 * @attribute created_at    [Date]          the time at which the notfication was created
 * @attribute updated_at    [Date]          the last time at which the notfication was updated
 *
 * @type {mongoose.Schema}
 */

var NotificationSchema = new mongoose.Schema({
    actor: {
        type: ObjectId,
        ref: 'User'
    },
    reciever: {
        type: ObjectId,
        ref: 'User'
    },
    post: {
        type: ObjectId,
        ref: 'Post'
    },
    question: {
        type: ObjectId,
        ref: 'Question'
    },
    subject: {
        type: ObjectId
    },
    seen: {
        type: Boolean
    },
    verb: {
        type: String
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    }
});

NotificationSchema.plugin(require('../helpers/notification'), 'Notification');

var Notification = module.exports = mongoose.model('Notification', NotificationSchema);
