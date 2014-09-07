var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('lodash');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
var Requirement = require('./requirement');
var relationship = require("mongoose-relationship");

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

UserQuestSchema.methods.check = function(user) {
    return this.requirements.every(function(r) {
        // console.log(user.get(r.property), r.property, r.condition, r.activation);
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
                return Requirement.findOneAndUpdate({
                    _id: req._id
                }, {
                    $addToSet: {
                        userQuests: userQuest._id //add userQuest is not already there
                    }
                }, {
                    safe: true,
                    upsert: true
                }).exec();
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
        var ids = _.map(reqs, '_id');
        // console.log(ids);
        return UserQuest.findOneAndUpdate({
            _id: userQuest.id
        }, {
            $addToSet: {
                requirements: {
                    $each: ids
                }
            }
        }, {
            safe: true,
            upsert: true
        }).exec();
    });
};

var UserQuest = module.exports = mongoose.model('UserQuest', UserQuestSchema);
