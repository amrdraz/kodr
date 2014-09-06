var mongoose = require('mongoose');
var observer = require('../mediator');
var crypto = require('crypto');
var util = require('util');
var bcrypt = require('bcrypt');
var relationship = require("mongoose-relationship");

var ObjectId = mongoose.Schema.ObjectId;
var Mixed = mongoose.Schema.Mixed;

var TEACHER = 'teacher';
var STUDENT = 'student';
var GUEST = 'guest';
var ADMIN = 'admin';

/**
 * User Schema.
 *
 * @attribute username      String          username used to login
 * @attribute email         String          email belonging to the user
 * @attribute password      String          password used to login
 * @attribute activated     Boolean         whther this user was activated or not
 * @attribute token         String          used for login and accessing api
 * @attribute role          String          can be student, teacher, or admin
 * @attribute exp           Number          indicates the amount of experiance the user poseses
 * @attribute rp            Number          indicates the amount of reward points the user accumilated
 * @attribute challenges    [Challenge]     challanges the user created
 * @attribute trials        [Trial]         trials the user started/passed
 * @attribute arenasTried   [ArenaTrial]    arneas the user entered/passed
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
    email: {
        type: String,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        match: /^.{10,}$/,
        trim: true
    },
    activated: {
        type: Boolean,
        default: false,
    },
    token: String,
    role: {
        type: String,
        'default': 'student',
        'enum': [TEACHER, STUDENT, ADMIN]
    },
    exp: {
        type: Number,
        'default': 0
    }, // experience points
    rp: {
        type: Number,
        'default': 0
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
    arenasTried: [{
        type: ObjectId,
        ref: 'ArenaTrial'
    }],
    groups: [{
        type: ObjectId,
        ref: 'Group',
        childPath: "founder"
    }],
    group: {
        type: ObjectId,
        ref: 'Group',
        childPath: "members"
    },
    userQuests: [{
        type: ObjectId,
        ref: 'UserQuest'
    }]
});


userSchema.plugin(relationship, {
    relationshipPathName: ['groups', 'group']
});


/**
 * the sum of both exp and rp
 * @return {Number}
 */
userSchema.virtual('points').get(function() {
    return this.exp + this.rp;
});

// userSchema.methods.quests = function() {
//     // UserQuest.find({_id:$in[this.userQuests]}).exec()
// };

userSchema.methods.toJSON = function() {
    var obj = this.toObject();
    obj.id = obj._id;
    delete obj.__v;
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
    var update = {
        $inc: {}
    };
    update.$inc[type] = value;
    User.findByIdAndUpdate(this.id, update, function(err, user) {
        if (err) throw err;
        // console.log('sending', err,user, obj);
        observer.emit('user.awarded', user, type, value);
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

var User = mongoose.model('User', userSchema);

/**
 * Event listner for when a trial is complete
 * @param  {Trial} trial trial that was just complete for the first time
 * @return {[type]}       [description]
 */
observer.on('trial.award', function(trial) {
    // console.log('user award hook caought in user', trial.user);
    User.findById(trial.user, function(err, user) {
        if (err) throw err;
        user.award('exp', trial.exp, trial);
    });
});

module.exports = User;
