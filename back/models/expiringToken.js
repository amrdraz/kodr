var mongoose = require('mongoose');
var Promise = require('bluebird');
var ObjectId = mongoose.Schema.ObjectId;
var Mixed = mongoose.Schema.Mixed;

/**
 * Log Schema.
 * The Log tracks user actions on the system, which achivments can be awarded for
 * actions follow the format
 *     user `passed` challenge
 *     user `tried` challenge
 *     user `gained` exp from challenge in arena
 *     user `posted` on discussion
 *     user `posted` on comment
 *
 * @type {mongoose.Schema}
 */

var ExpiringTokenSchema = new mongoose.Schema({
    'for': {
        type: String,
        'enum': ['newaccount', 'password']
    },
    used: {
        type: Boolean,
        default:false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '1h'
    },
    user: {
        type: ObjectId,
        ref: 'User'
    }
});

ExpiringTokenSchema.statics.getToken = function (id) {
    return Promise.fulfilled()
    .then(function () {
        var date = new Date();
        date.setHours(date.getHours()-1);
        return ExpiringToken.findOne({_id:id, used:false, createdAt:{$gte:date}}).exec().then(function (exec) {
            if(!exec) return null;
            exec.used = true;
            exec.save();
            return exec;
        });
    });
};

var ExpiringToken = mongoose.model('ExpiringToken', ExpiringTokenSchema);

module.exports = ExpiringToken;
