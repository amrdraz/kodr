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


var AchievementSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    requirements: {
        type: [Mixed],
    },
    author: {
        type: ObjectId,
        ref: 'User'
    }
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

AchievementSchema.methods.check = function (user) {
    return this.requirements.every(function(r) {
        // console.log(user.get(r.property), r.property, r.condition, r.activation);
        return isActive(user.get(r.property), r.condition, r.activation);
    });
};

AchievementSchema.statics.new = function (name, property, condition, activation) {
    var requirements = [];
    var met = false;

    if (property instanceof Array) {
        requirements = JSON.parse(JSON.stringify(property));
    } else {
        requirements.push({
            property: property,
            condition: condition,
            activation: activation
        });
    }
}

module.exports = mongoose.model('Achievement', AchievementSchema);
