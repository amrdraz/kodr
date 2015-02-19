var mongoose = require('mongoose');
var relationship = require("mongoose-relationship");
var Promise = require('bluebird');
var _ = require('lodash');
var Requirement = require('./requirement');
var ArenaTrial = require('./arenaTrial');
var Trial = require('./trial');
var observer = require('../observer');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;

/**
 * UserQuest Schema.
 * An achievement is a means of indicating progress
 * It reuires a certain expreiance level to be achieved one or several arenas
 *
 * @type {mongoose.Schema}
 */

var UserQuestSchema = new mongoose.Schema({
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
    requirements: [{
        type: ObjectId,
        ref: 'Requirement'
    }],
    startTime: {
        type:Date,
        default:Date.now
    },
    complete:{
        type:Boolean,
        default:false
    },
    completeTime: {
        type:Date
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

UserQuestSchema.plugin(require('../helpers/userQuest'));


UserQuestSchema.methods.toJSON = function() {
    var uq = this.toObject();
    uq.id = uq._id;
    delete uq.__v;
    return uq;
};


// this function is too big and must die
// it checks if all requirments are set and updates the userQuest of the current progress
// UserQuestSchema.methods.check = function(userId) {
//     var quest = this;
//     return Promise.reduce(quest.requirements, function(met, req) {
//         if (req.met >= req.times) return met && true;
//         return Promise.fulfilled().then(function() {
//             if (req.model1 === 'Challenge') {
//                 if (req.id1) { //specific challenge
//                     return Trial.findOne({
//                         challenge: req.id1,
//                         user: userId,
//                         complete: true
//                     }).exec().then(function(tr) {
//                         if (!tr) return false;
//                         req.met = 1;
//                         return met && req.met;
//                     });
//                 } else { //any challenge
//                     if (req.id2) { // specific arena
//                         return ArenaTrial.findOne({
//                             arena: req.id2,
//                             user: userId
//                         }, '_id').exec().then(function(at) {
//                             if (!at) return false;
//                             return Trial.find({
//                                 arenaTrial: at,
//                                 user: userId,
//                                 complete: true
//                             }).exec().then(function(tr) {
//                                 req.met = tr.length;
//                                 if (req.met < req.times) return false;
//                                 return met && true;
//                             });
//                         });
//                     } else { // any arena
//                         return Trial.find({
//                             user: userId,
//                             complete: true
//                         }).exec().then(function(tr) {
//                             req.met = tr.length;
//                             if (req.met < req.times) return false;
//                             return met && true;
//                         });
//                     }
//                 }
//             } else {
//                 if (req.id1) { //specific Arena
//                     return ArenaTrial.findOne({
//                         arena: req.id1,
//                         user: userId,
//                         complete: true
//                     }).exec().then(function(tr) {
//                         if (!tr) return false;
//                         return met && true;
//                     });
//                 } else { //any arena
//                     return ArenaTrial.find({
//                         user: userId,
//                         complete: true
//                     }).exec().then(function(tr) {
//                         req.met = tr.length;
//                         if (req.met < req.times) return false;
//                         return met && true;
//                     });
//                 }
//             }
//         });
//     }, true).then(function(value) {

//     });
// };


var UserQuest = module.exports = mongoose.model('UserQuest', UserQuestSchema);

require('../events/userQuest').model(UserQuest);
