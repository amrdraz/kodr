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

var FORGOTPASS = 'forgotpass';
var VERIFICATION = 'verification';
var ExpiringTokenSchema = new mongoose.Schema({
    'for': {
        type: String,
        'enum': [VERIFICATION, FORGOTPASS]
    },
    used: {
        type: Boolean,
        default: false
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


ExpiringTokenSchema.statics.getToken = function(id) {
    return Promise.fulfilled().then(function() {
        var date = new Date();
        date.setHours(date.getHours() - 24);
        return ExpiringToken.findOne({
            _id: id,
            used: false,
            createdAt: {
                $gte: date
            }
        }).exec();
    });
};

ExpiringTokenSchema.statics.useToken = function(id) {
    return ExpiringToken.getToken(id).then(function(exToken) {
        if (!exToken) return null;
        exToken.used = true;
        exToken.save();
        return exToken;
    });
};


ExpiringTokenSchema.statics.toVerify = function(user) {
    return Promise.fulfilled().then(function() {
        return ExpiringToken.create({user: user._id, 'for': 'verification'});
    });
};

var ExpiringToken = mongoose.model('ExpiringToken', ExpiringTokenSchema);

ExpiringToken.FORGOTPASS = FORGOTPASS;
ExpiringToken.VERIFICATION = VERIFICATION;

module.exports = ExpiringToken;
