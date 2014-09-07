var mongoose = require('mongoose');
var Promise = require('bluebird');
var util = require('util');
var UserQuest = require('./userQuest');
var ArenaTrial = require('./arenaTrial');
var Trial = require('./trial');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;

/**
 * Quest Schema.
 * An achievement is a means of indicating progress
 * It reuires a certain expreiance level to be achieved one or several arenas
 *
 * @type {mongoose.Schema}
 */

var QuestSchema = new mongoose.Schema({
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
    isPublished:{
        type:Boolean,
        default:false
    },
    requirements: [{
        type: Mixed,
    }],
    author: {
        type: ObjectId,
        ref: 'User'
    },
    userQuests: [{
        type: ObjectId,
        ref: 'UserQuest'
    }]
});

// this function is too big and must die
// it checks if all requirments are set and updates the userQuest of the current progress
QuestSchema.methods.check = function(userId) {
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
        return Quest.assign(userId, quest).then(function(uq) {
            // uq.requirements.forEach(function(req) {
            //     console.log('--', req);
            // });
            return Promise.resolve(value);
        });
    });
};

QuestSchema.methods.assign = function(userId) {
    return Quest.assign(userId, this);
};

/**
 * Assign quest to user or updates requirements if already assigned
 * @param  {ObjectId} userId  [description]
 * @param  {Quest} quest [description]
 * @return {UserQuest}       [description]
 */
QuestSchema.statics.assign = function(userId, quest) {
    if(!quest.isPublished) return Promise.reject('You can not assign an Un-Published quest');
    return Promise.fulfilled().then(function() {
        return UserQuest.create({
            name:quest.name,
            description:quest.description,
            rp:quest.rp,
            quest: quest.id,
            user: userId
        }).setRequirements(quest.requirments);
    });
};
var Quest = module.exports = mongoose.model('Quest', QuestSchema);
