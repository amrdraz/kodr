var mongoose = require('mongoose');
var util = require('util');
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
    timeLimit: {
        type:Number, // time since start in seconds
        default: 0 // ie no time limit
    },
    endDate: { 
       type:Date 
    },
    isPublished:{
        type:Boolean,
        default:false
    },
    requirements: [{
        type: Mixed,
    }],
    author: {
        type: ObjectId,
        ref: 'User'
    },
    userQuests: [{
        type: ObjectId,
        ref: 'UserQuest'
    }]
});


QuestSchema.plugin(require('../helpers/quest'), 'Quest');

var Quest = module.exports = mongoose.model('Quest', QuestSchema);
