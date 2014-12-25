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
 * Group Member Schema.
 * This model holds information about a user's membership in a group
 *
 * @attribute name          String      The Name of the group
 * @attribute exp           Number      The amount of experiance gained by user as member
 * @attribute user          User        the user's id

 * @type {mongoose.Schema}
 * @exports {mongoose.model}
 */

var MemberSchema = new mongoose.Schema({
    uname: {
        type: String,
        default: function() {
            return generateName();
        }
    },
    gname: {
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
    isActive: {
        type:Boolean,
        default:false
    },
    status: {
        type:String,
        enum:['current', 'new', 'old'],
        default:'new'
    },
    role: {
        type:String,
        enum:['subscriber', 'leader', 'owner'],
        default:'subscriber'
    },
    user: {
        type: ObjectId,
        ref: 'User',
        childPath: "membership",
    },
    group: {
        type: ObjectId,
        ref: 'Group',
        childPath: "members",
    },
    createdOn:{
        type:Date,
        default: Date.now
    }
});

MemberSchema.virtual('isLeader').get(function() {
    return this.role==='leader';
});

MemberSchema.virtual('isOwner').get(function() {
    return this.role==='leader';
});

MemberSchema.virtual('isSubscriber').get(function() {
    return this.role==='subscriber';
});

MemberSchema.plugin(relationship, {
    relationshipPathName: ['user', 'group']
});


MemberSchema.plugin(require('../../back/helpers/member'));

var Member = module.exports = mongoose.model('Member', MemberSchema);
