var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;

/**
 * Achievement Schema.
 * An achievement is a means of indicating progress
 * It reuires a certain expreiance level to be achieved one or several arenas
 * 
 * @type {mongoose.Schema}
 */

var UserAchievement = new mongoose.Schema({
    achievement: {
        type: ObjectId,
        ref:'Achievement'
    },
    requirements: {
        type: [Mixed],
    },
    user: {
        type: ObjectId, ref: 'User'
    },
    
});

AchievementSchema.methods.isActive = function (value, condition, activation) {
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

UserAchievement.methods.check = function (player) {
    return this.requirements.every(function(r) {
        return this.isActive(player.get(r.property), r.condition, r.activation);
    }));
};

module.exports = mongoose.model('Achievement', UserAchievement);
