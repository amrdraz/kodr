var mongoose = require('mongoose');
var Promise = require('bluebird');
var generateName = require('sillyname');
var debounce = require('lodash').debounce;
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
var relationship = require("mongoose-relationship");
var observer = require('../mediator');

/**
 * Arena User Schema.
 * This model holds information about user preformance inside a particular arena
 * alows us to form metrics such as how many challenges did he solve, experiance gained here
 * and anything related to user and arena
 *
 * @attribute name          String      The Name of the group
 * @attribute exp           Number      The amount of experiance gained by students in the group
 * @attribute founder       User        The owner of the group
 * @attribute members       [User]      The memebrs of the group

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
    founder: {
        type: ObjectId,
        ref: 'User',
        childPath: "groups"
    },
    members: [{
        type: ObjectId,
        ref: 'User',
        childPath: "group",
    }]

});

GroupSchema.plugin(relationship, {
    relationshipPathName: ['founder', 'members']
});


GroupSchema.methods.push = function(user) {
    
};
GroupSchema.methods.poop = function(user) {
    
};

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
