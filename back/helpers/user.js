var Promise = require('bluebird');
var _ = require('lodash');
var generateName = require('sillyname');

var bcrypt = require('bcrypt');
var crypto = require('crypto');

var debounce = _.debounce;
var observer = require('../observer');

module.exports = exports = function (schema, options) {
    var Model = options.model || options;
    schema.plugin(require('./_common_helper'), options);


    schema.methods.toJSON = function() {
        var obj = this.toObject();
        obj.id = obj._id;
        delete obj.__v;
        delete obj.password;
        delete obj.tempPassword;
        delete obj.token;
        return obj;
    };

    /**
     * User Schema pre-save hooks.
     * It is used for hashing and salting user's password and token.
     */

    schema.pre('save', true, function(next, done) {
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
     * Helper method for comparing user's password input with a
     * hashed and salted password stored in the database.
     */

    schema.methods.comparePassword = function(candidatePassword, cb) {
        bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
            if (err) return cb(err);
            cb(null, isMatch);
        });
    };


    schema.methods.hasFlag = function(flag) {
        return this.flags && this.flags[flag]!==undefined;
    };

    schema.methods.getFlag = function(flag) {
        return this.flags && this.flags[flag];
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
    schema.methods.award = function(type, value, obj) {
        var Model = this.db.model('User');
        var update = {
            $inc: {}
        };
        update.$inc[type] = value;
        Model.findByIdAndUpdate(this.id, update, {
            new: true
        }, function(err, user) {
            if (err) return err;
            // console.log('sending', err,user, obj);
            observer.emit('user.awarded', user, type, value);
        });
    };


    schema.statics.findOrCreate = function(memb) {
        var User = this.db.model('User');
        return Promise.fulfilled().then(function() {
            return User.findOne({
                group: memb.group,
                user: memb.user
            }).exec();
        }).then(function(m) {
            if (m) return m;
            return User.create(memb);
        });
    };



    schema.statics.findByIdentity = function(identity) {
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

    schema.statics.setSocketId = function(uid, sid) {
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
    schema.statics.getUserBySocketId = function(sid) {
        var Model = this.db.model('User');
        return Promise.fulfilled().then(function() {
            return Model.findOne({
                socketId: sid
            }).exec();
        });
    };


};
