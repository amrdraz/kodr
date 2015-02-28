var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('lodash');
var generateName = require('sillyname');
var debounce = _.debounce;
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
var relationship = require("mongoose-relationship");
var observer = require('../observer');

/**
 * Group Schema.
 * @type {mongoose.Schema}
 * @exports {mongoose.model}
 */

var GroupSchema = new mongoose.Schema({
    name: {
        type: String,
        default: function() {
            return generateName();
        }
    },
    exp: {
        type:Number,
        default:0,
        min:0
    },
    members: [{
        type: ObjectId,
        ref: 'Member',
    }]

});


GroupSchema.methods.changed = function(members) {
    return _.isEqual(this.members, members, function (a,b) {
        return a.equals(b);
    });
};

GroupSchema.plugin(require('../helpers/group'), 'Group');

var Group = mongoose.model('Group', GroupSchema);

// var queue = Promise.fulfilled();
var timeout;
// observer.on('user.awarded', function(user, type, value) {
//     console.log('user awarded now updating group',user, type, value);
//     if(user && user.group) {
//         Group.findByIdAndUpdate(user.group, {$inc:{exp:value}});
//     }
// });

module.exports = Group;
