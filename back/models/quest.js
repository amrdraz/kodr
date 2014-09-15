var mongoose = require('mongoose');
var Promise = require('bluebird');
var util = require('util');
var UserQuest = require('./userQuest');
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
    endDate:{
       type:Date 
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
        }).then(function (uq) {
            return uq.setRequirements(quest.requirements);
        });
    });
};
var Quest = module.exports = mongoose.model('Quest', QuestSchema);
