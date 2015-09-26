var mongoose = require('mongoose');
var Promise = require('bluebird');
var observer = require('../observer');
var crypto = require('crypto');
var util = require('util');
var bcrypt = require('bcrypt');
var relationship = require("mongoose-relationship");


var ExpiringToken = require('../models/expiringToken');
var Challenge = require('../models/challenge');
var mail = require('../config/mail');

var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;

var TEACHER = 'teacher';
var STUDENT = 'student';
var GUEST = 'guest';
var ADMIN = 'admin';

/**
 * User Schema.
 *
 * @attribute username      String          username used to login
 * @attribute email         String          email belonging to the user
 * @attribute uniId         String          university ID belonging to the user
 * @attribute lectureGroup  String          lecture group used for segmentation (should probably abstract these data later)
 * @attribute labGroup      String          lab group used for segmentation (should probably abstract these data later)
 * @attribute password      String          password used to login
 * @attribute activated     Boolean         whther this user was activated or not
 * @attribute token         String          used for login and accessing api
 * @attribute flags         Object          an object containing flags that enable and disbale features
 * @attribute role          String          can be student, teacher, or admin
 * @attribute exp           Number          indicates the amount of experiance the user poseses
 * @attribute rp            Number          indicates the amount of reward points the user accumilated
 * @attribute challenges    [Challenge]     challanges the user created
 * @attribute trials        [Trial]         trials the user started/passed
 * @attribute userArenas   [UserArena]    arneas the user entered/passed
 * @attribute groups        [Group]         groups owned by the user
 * @attribute group         Group           group he is a member of
 *
 * @type {mongoose.Schema}
 */

var userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        match: /^\w[\w.-\d]{3,}$/,
        trim: true
    },
    socketId: String,
    uniId: {
        type: String,
        match: /^\d+\-\d{3,5}$/,
    },
    lectureGroup:String,
    labGroup:String,
    email: {
        type: String,
        unique: true,
        trim: true
    },
    tempPassword: {
        type: String,
        match: /^.{8,}$/,
        trim: true
    },
    password: {
        type: String,
        match: /^.{8,}$/,
        trim: true
    },
    activated: {
        type: Boolean,
        default: false,
    },
    flags: {
        type:Mixed,
        default: function () {
            {}
        }
    },
    token: String,
    role: {
        type: String,
        'default': 'student',
        'enum': [TEACHER, STUDENT, ADMIN]
    },
    exp: {
        type: Number,
        'default': 0,
        min: 0
    }, // experience points
    rp: {
        type: Number,
        'default': 0,
        min: 0
    }, // reputation points
    challenges: {
        type: [ObjectId],
        ref: 'Challenge'
    },
    arenas: {
        type: [ObjectId],
        ref: 'Arena'
    },
    trials: [{
        type: ObjectId,
        ref: 'Trial'
    }],
    userArenas: [{
        type: ObjectId,
        ref: 'UserArena'
    }],
    memberships: [{
        type: ObjectId,
        ref: 'Member',
    }],
    userQuests: [{
        type: ObjectId,
        ref: 'UserQuest'
    }],
    activities: [{
        type: ObjectId,
        ref: 'Activity'
    }]
});


// userSchema.plugin(relationship, {
//     relationshipPathName: ['memberships']
// });
userSchema.plugin(require('../helpers/user'), 'User');
// 
/**
 * is this object a user
 * @return {Boolean}
 */
userSchema.virtual('isUser').get(function() {
    return true;
});


/**
 * is user a student
 * @return {Boolean}
 */
userSchema.virtual('isStudent').get(function() {
    return this.role === 'student';
});

/**
 * is user a teacher
 * @return {Boolean}
 */
userSchema.virtual('isTeacher').get(function() {
    return this.role === 'teacher';
});

/**
 * is user admin
 * @return {Boolean}
 */
userSchema.virtual('isAdmin').get(function() {
    return this.role === 'admin';
});

/**
 * the sum of both exp and rp
 * @return {Number}
 */
userSchema.virtual('points').get(function() {
    return this.exp + this.rp;
});

userSchema.methods.toJSON = function() {
    var obj = this.toObject();
    obj.id = obj._id;
    delete obj.__v;
    delete obj.password;
    delete obj.tempPassword;
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


/**
 * User Schema pre-save hooks.
 * It is used for hashing and salting user's password and token.
 */

userSchema.pre('save', true, function(next, done) {
    next();
    var user = this;

    if (!user.isModified('password')) return done(null, user);

    var hashContent = user.username + user.password + Date.now() + Math.random();
    user.token = crypto.createHash('sha1').update(hashContent).digest('hex');

    bcrypt.genSalt(5, function(err, salt) {
        if (err) return done(err);
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return done(err);
            user.password = hash;
            done(null, user);
        });
    });
});


/**
 * award a user with amount of points based on the type of points
 * after awarding an event is published indicating that this user was awarded
 *
 * @param  {Stting} type  type of the award (can be 'exp' or 'rp')
 * @param  {Numberf} value the amount awarded
 * @param  {Mixed} obj   object that the award originated from
 * @event  'user.awarded' published the user awarded the type of award and its value
 */
userSchema.methods.award = function(type, value, obj) {
    var Model = this.db.model('User');
    var update = {
        $inc: {}
    };
    update.$inc[type] = value;
    Model.findByIdAndUpdate(this.id, update, {new:true}, function(err, user) {
        if(err) return err;
        // console.log('sending', err,user, obj);
        observer.emit('user.awarded', user, type, value);
    });
};


userSchema.statics.findByIdentity = function(identity) {
    var Model = this.db.model('User');
    return Model.findOne({
        $or: [{
            'username': identity
        }, {
            'email': identity,
        }, {
            'uniId': identity,
        }]
    }).exec();
};

userSchema.statics.setSocketId = function(uid, sid) {
    var Model = this.db.model('User');
    return Promise.fulfilled().then(function() {
        return Model.update({
            _id: uid
        }, {
            $set: {
                socketId: sid
            }
        }).exec();
    });
};
userSchema.statics.getUserBySocketId = function(sid) {
    var Model = this.db.model('User');
    return Promise.fulfilled().then(function() {
        return Model.findOne({
            socketId: sid
        }).exec();
    });
};

var User = mongoose.model('User', userSchema);

require('../events/user').model(User);

module.exports = User;
