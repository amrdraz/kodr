var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;

/**
 * Requirement Schema.
 * A condition that triggers the completion of an Achievement or a Quest, is a means of indicating progress
 * requirments are checked for a user using the isActive function
 *
 * @property {Mixed}    property        The property that has a requirment set on it
 * 
 * @property {Mixed}    condition       The condition that triggers the activation
 *                                      Can be of type '<=', '>=', '=' for properties of type number type
 *                                      
 * @property {Mixed}    activation      The activation value for the condition
 *
 * @type {mongoose.Schema}
 */

var RequirementSchema = new mongoose.Schema({
    property: {
        type: Mixed,
    },
    condition: {
        type: Mixed,
    },
    activation: {
        type: Mixed,
    }
});

/**
 * takes a user and checks whether this requirment is active for him
 * @param  {[type]}  user [description]
 * @return {Boolean}      [description]
 */
RequirementSchema.methods.isActive = function (user) {
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

module.exports = mongoose.model('Requirement', RequirementSchema);
