var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;

/**
 * Arena User Schema.
 * This model holds information about user preformance inside a particular arena
 * alows us to form metrics such as how many challenges did he solve, experiance gained here
 * and anything related to user and arena
 *
 * @attribute exp           Number      The amount of experiance gained per challenge
 * @attribute trials        [Trial]     The challenges the user tried in this arena
 * @attribute arena         Arean       The Arena the metrics is tracked for
 * @attribute user          User        The relevent user

 * @type {mongoose.Schema}
 * @exports {mongoose.model}
 */

var ArenaUserSchema = new mongoose.Schema({
    exp: {
        type: Number, min:0
    },
    trials: {
        type: [ObjectId], ref: 'Trial'
    },
    arena: {
        type: ObjectId, ref: 'Arena'
    },
    author: {
        type: ObjectId, ref: 'User'
    },
    
});

module.exports = mongoose.model('ArenaUser', ArenaUserSchema);
