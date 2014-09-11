var mongoose = require('mongoose');
var relationship = require("mongoose-relationship");
var Promise = require('bluebird');
var _ = require('lodash');
var Requirement = require('./requirement');
var ArenaTrial = require('./arenaTrial');
var Trial = require('./trial');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;

/**
 * UserQuest Schema.
 * An achievement is a means of indicating progress
 * It reuires a certain expreiance level to be achieved one or several arenas
 *
 * @type {mongoose.Schema}
 */

var UserQuestSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    rp: {
        type: Number,
        default: 0,
        min: 0
    },
    requirements: [{
        type: ObjectId,
        ref: 'Requirement'
    }],
    quest: {
        type: ObjectId,
        ref: 'Quest',
        childPath: "userQuests"
    },
    user: {
        type: ObjectId,
        ref: 'User',
        childPath: "userQuests"
    }
});


UserQuestSchema.plugin(relationship, {
    relationshipPathName: ['user', 'quest']
});

UserQuestSchema.methods.toJSON = function() {
    var uq = this.toObject();
    uq.id = uq._id;
    delete uq.__v;
    return uq;
};


// this function is too big and must die
// it checks if all requirments are set and updates the userQuest of the current progress
UserQuestSchema.methods.check = function(userId) {
    var quest = this;
    return Promise.reduce(quest.requirements, function(met, req) {
        if (req.met >= req.times) return met && true;
        return Promise.fulfilled().then(function() {
            if (req.model1 === 'Challenge') {
                if (req.id1) { //specific challenge
                    return Trial.findOne({
                        challenge: req.id1,
                        user: userId,
                        complete: true
                    }).exec().then(function(tr) {
                        if (!tr) return false;
                        req.met = 1;
                        return met && req.met;
                    });
                } else { //any challenge
                    if (req.id2) { // specific arena
                        return ArenaTrial.findOne({
                            arena: req.id2,
                            user: userId
                        }, '_id').exec().then(function(at) {
                            if (!at) return false;
                            return Trial.find({
                                arenaTrial: at,
                                user: userId,
                                complete: true
                            }).exec().then(function(tr) {
                                req.met = tr.length;
                                if (req.met < req.times) return false;
                                return met && true;
                            });
                        });
                    } else { // any arena
                        return Trial.find({
                            user: userId,
                            complete: true
                        }).exec().then(function(tr) {
                            req.met = tr.length;
                            if (req.met < req.times) return false;
                            return met && true;
                        });
                    }
                }
            } else {
                if (req.id1) { //specific Arena
                    return ArenaTrial.findOne({
                        arena: req.id1,
                        user: userId,
                        complete: true
                    }).exec().then(function(tr) {
                        if (!tr) return false;
                        return met && true;
                    });
                } else { //any arena
                    return ArenaTrial.find({
                        user: userId,
                        complete: true
                    }).exec().then(function(tr) {
                        req.met = tr.length;
                        if (req.met < req.times) return false;
                        return met && true;
                    });
                }
            }
        });
    }, true).then(function(value) {

    });
};

/**
 * Parses an array of requirement definitions making sure to reduce redundency
 * by finding already existing requirments and linking them to the UserQuest
 * also takes into consideration the current progress of the previous requirments (req),
 *     for instance if a req has `completed 2` out of `3 times` and the new similar def for this user is `times 2`
 *     then a new req is created wth `completed 2` and `complete true`, is the new def is `times 4` then a new req
 *     is created with `completed 2`, `complete false` and `times 4`
 * @param {Array} requirements array of requirement definitions
 * @returns {Promise} A promise with value userQuest
 */
UserQuestSchema.methods.setRequirements = function(requirements) {
    var userQuest = this;
    return Promise.map(requirements, function(r) {
        r.times = r.times || 1;
        r.user = userQuest.user;
        // console.log(r);
        var query = {
            model1: r.model1,
            id1: r.id1,
            model2: r.model2,
            id2: r.id2,
            user: userQuest.user
        };
        // console.log(query);
        return Requirement.findOne(query).sort('-times').exec().then(function(req) {
            if (req && req.times === r.times) { //requirment already exist with exaclty the same number of times
                var length = req.userQuests.length;
                req.userQuests.push(userQuest._id);
                var userQuests = _.uniq(req.userQuests, function(id) {
                    return id.toString();
                });
                if (length!==userQuests.length) {
                    req.userQuests = userQuests;
                    req.markModified('userQuests');
                    return new Promise(function (resolve,reject) {
                        req.save(function(err, model) {
                            if(err) return reject(err);
                            resolve(model);
                        });
                    });
                }
                return req;
                // return Requirement.findOneAndUpdate({
                //     _id: req._id
                // }, {
                //     $addToSet: {
                //         userQuests: userQuest._id //add userQuest is not already there
                //     }
                // }, {
                //     safe: true,
                //     upsert: true
                // }).exec();
            } else {
                if (req) { // a similar req already exist but differen repat times
                    r.completed = Math.min(req.completed, r.times);
                    r.complete = r.completed === r.times;
                }
                r.userQuests = [userQuest.id];
                return Requirement.create(r);
            }
        });
    }).then(function(reqs) {
        // console.log(ids);
        return UserQuest.findOne({
            _id: userQuest.id
        }).populate('requirements').exec();
    });
};

var UserQuest = module.exports = mongoose.model('UserQuest', UserQuestSchema);
