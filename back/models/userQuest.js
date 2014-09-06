var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
var relationship = require("mongoose-relationship");

/**
 * UserQuest Schema.
 * An achievement is a means of indicating progress
 * It reuires a certain expreiance level to be achieved one or several arenas
 *
 * @type {mongoose.Schema}
 */

var UserQuestSchema = new mongoose.Schema({
    requirements: {
        type: [Mixed],
    },
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

function isActive (value, condition, activation) {
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

UserQuestSchema.methods.check = function (user) {
    return this.requirements.every(function(r) {
        // console.log(user.get(r.property), r.property, r.condition, r.activation);
        return isActive(user.get(r.property), r.condition, r.activation);
    });
};

UserQuestSchema.methods.toJSON = function () {
    var uq = this.toObject();
    uq.id = uq._id;
    delete uq.__v;
    return uq;
};

module.exports = mongoose.model('UserQuest', UserQuestSchema);
