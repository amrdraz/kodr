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
    requirements: [{
        type: Mixed,
    }],
    author: {
        type: ObjectId,
        ref: 'User'
    },
    users: [{
        type: ObjectId,
        ref: 'UserQuest'
    }]
});


function isActive(value, condition, activation) {
    var res = false;
    switch (condition) {
        case '>=':
            res = (value >= activation);
            break;
        case '<=':
            res = (value <= activation);
            break;
        case '==':
            res = (value === activation);
            break;
    }

    return res;
}

// this function is too big and must die
// it checks if all requirments are set and updates the userQuest of the current progress
QuestSchema.methods.check = function(user) {
    var quest = this;
    return Promise.reduce(quest.requirements, function(met, req) {
        if (req.met >= req.times) return met && true;
        return Promise.fulfilled().then(function() {
            if (req.model1 === 'Challenge') {
                if (req.id1) { //specific challenge
                    return Trial.findOne({
                        challenge: req.id1,
                        user: user.id,
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
                            user: user.id
                        }, '_id').exec().then(function(at) {
                            if (!at) return false;
                            return Trial.find({
                                arenaTrial: at,
                                user: user.id,
                                complete: true
                            }).exec().then(function(tr) {
                                req.met = tr.length;
                                if (req.met < req.times) return false;
                                return met && true;
                            });
                        });
                    } else { // any arena
                        return Trial.find({
                            user: user.id,
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
                        user: user.id,
                        complete: true
                    }).exec().then(function(tr) {
                        if (!tr) return false;
                        return met && true;
                    });
                } else { //any arena
                    return ArenaTrial.find({
                        user: user.id,
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
        return Quest.assignOrUpdate(user, quest).then(function(uq) {
            // uq.requirements.forEach(function(req) {
            //     console.log('--', req);
            // });
            return Promise.resolve(value);
        });
    });
};

QuestSchema.methods.assignOrUpdate = function(user) {
    return Quest.assignOrUpdate(user, this);
};

/**
 * Assign quest to user or updates requirements if already assigned
 * @param  {[type]} user  [description]
 * @param  {[type]} quest [description]
 * @return {[type]}       [description]
 */
QuestSchema.statics.assignOrUpdate = function(user, quest) {
    return Promise.fulfilled().then(function(argument) {
        return UserQuest.findOne({
            user: user.id,
            quest: quest.id
        }).exec();
    }).then(function(model) {
        if (model) {
            model.requirements = quest.requirements;
            return new Promise(function(resolve, reject) {
                model.save(function(err, model) {
                    if (err) return reject(err);
                    resolve(model);
                });
            });
        }
        return UserQuest.create({
            user: user.id,
            quest: quest.id,
            requirements: quest.requirements
        });
    });
};
var Quest = module.exports = mongoose.model('Quest', QuestSchema);
