var mongoose = require('mongoose');
var observer = require('../mediator');
var crypto = require('crypto');
var util = require('util');
var bcrypt = require('bcrypt');
var ObjectId = mongoose.Schema.ObjectId;
var Mixed = mongoose.Schema.Mixed;

/**
 * User Schema.
 *
 * @type {mongoose.Schema}
 */

var userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        unique: true
    },
    password: String,
    token: String,
    role:String,
    exp:{type:Number, 'default':0}, // experience points
    rp:{type:Number, 'default':0},  // reputation points
    challenges: {
        type: [ObjectId],
        ref: 'Challenge'
    },
    trials: [{
        type: ObjectId,
        ref: 'Trial'
    }],
    arenasTried: [{
        type: ObjectId,
        ref: 'ArenaTrial'
    }]
});

/**
 * User Schema pre-save hooks.
 * It is used for hashing and salting user's password and token.
 */

userSchema.pre('save', function(next) {
    var user = this;

    if (!user.isModified('password')) return next();

    var hashContent = user.username + user.password + Date.now() + Math.random();
    user.token = crypto.createHash('sha1').update(hashContent).digest('hex');

    bcrypt.genSalt(5, function(err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.password;
    delete obj.token;
    return obj;
};

/**
 * Helper method for comparing user's password input with a
 * hashed and salted password stored in the database.
 */

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

userSchema.methods.award = function(type, value, obj) {
    this[type] += value;
    // console.log('assigning user',type,'value',value);
    // send activity notification
    this.save(function (err, user) {
        observer.emit('user.awarded', user, type, value);
    });
};

var User = mongoose.model('User', userSchema);

observer.on('user.award', function (type,value,obj) {
    // console.log('user award hook caought in user');
    User.findById(obj.user, function (err, user) {
        if (err) throw err;
        user.award('exp', value, obj);
    });
});

module.exports = User;
