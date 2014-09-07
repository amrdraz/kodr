var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
var relationship = require("mongoose-relationship");

/**
 * Requirement Schema.
 * A condition that triggers the completion of an Achievement or a Quest, is a means of indicating progress
 * requirments are checked for a user using the isActive function
 *
 * @property {Mixed}    property        The property that has a requirement set on it
 *
 * @property {Mixed}    condition       The condition that triggers the activation
 *                                      Can be of type '<=', '>=', '=' for properties of type number type
 *
 * @property {Mixed}    activation      The activation value for the condition
 *
 * @type {mongoose.Schema}
 */

var RequirementSchema = new mongoose.Schema({
    model1: {
        type: String,
        default: 'Challenge'
    },
    id1: String,
    model2: {
        type: String,
        default: 'Arena'
    },
    id2: String,
    action: {
        type: String,
        default: 'complete',
        enum: ['complete', 'get']
    },
    times: {
        type: Number,
        default: 1,
        min: 1
    },
    completed: {
        type: Number,
        default:0
    },
    complete: {
        type:Boolean,
        default:false
    },
    property: {
        type: Mixed,
    },
    condition: {
        type: Mixed,
    },
    activation: {
        type: Mixed,
    },
    user: {
        type:ObjectId,
        ref:'User'
    },
    userQuests: [{
        type: ObjectId,
        ref: 'UserQuest',
        childPath: 'requirements'
    }]
});


RequirementSchema.plugin(relationship, {
    relationshipPathName: ['userQuests']
});


/**
 * takes a user and checks whether this requirment is active for him
 * @param  {[type]}  user [description]
 * @return {Boolean}      [description]
 */
RequirementSchema.methods.isActive = function(obj) {
    var res = false;
    switch (this.condition) {
        case '>=':
            res = (obj[this.property] >= this.activation);
            break;
        case '<=':
            res = (obj[this.property] <= this.activation);
            break;
        case '==':
            res = (obj[this.property] === this.activation);
            break;
    }
    return res;
};

module.exports = mongoose.model('Requirement', RequirementSchema);
