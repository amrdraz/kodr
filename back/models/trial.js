var mongoose = require('mongoose');
var version = require('mongoose-version');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;

/**
 * Trial Schema.
 * A trial is a users attempt on a challenge
 * versions of the trial are maintained for analysing the user's preformance
 *
 * @attribute code      String      Users's code submittion
 * @attribute completed Boolean     Whether the user passes or not
 * @attribute tests     Mixed       The result of the tests run on the code
 * @attribute challenge Challenge   The Challenge the trial is on
 * @attribute user      User        The User trying the challenge
 *
 * @type {mongoose.Schema}
 */

var Trial = new mongoose.Schema({
    code: {
        type: String,
    },
    times: {
        type: Number,
        'default':0
    },
    completed: {
        type: Boolean
    },
    tests: Mixed,
    time: {
        type: Date,
        'default': Date.now
    },
    challenge: {
        type: ObjectId, ref: 'Challenge',
        required: true
    },
    user: {
        type: ObjectId, ref: 'User'
    },
    
});

Trial.plugin(version, { collection: 'TrialVersions', log:true });

module.exports = mongoose.model('Trial', Trial);
