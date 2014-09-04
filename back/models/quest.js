var mongoose = require('mongoose');
var Promise = require('bluebird');
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
    requirements: {
        type: [Mixed],
    },
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
};

QuestSchema.methods.check = function(user) {
    return this.requirements.every(function(r) {
        // console.log(user.get(r.property), r.property, r.condition, r.activation);
        return isActive(user.get(r.property), r.condition, r.activation);
    });
};

QuestSchema.methods.assign = function(user) {
    return Quest.assign(user, this)
};

QuestSchema.statics.assign = function(user, quest) {
    return Promise.fulfilled().then(function() {
        return UserQuest.create({
            user: user.id,
            quest: quest.id,
            requirements: quest.requirements
        })
    });
};
var Quest = module.exports = mongoose.model('Quest', QuestSchema);
