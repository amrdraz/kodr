var mongoose = require('mongoose');
var Promise = require('bluebird');
var debounce = require('debounce');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
var relationship = require("mongoose-relationship");
var observer = require('../mediator');
var Trial = require("./trial");

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

var ArenaTrialSchema = new mongoose.Schema({
    exp: {
        type: Number,
        'default': 0,
        min: 0
    },
    complete: {
        type: Boolean,
        'default': false
    },
    completed: {
        type: Number,
        'default': 0
    },
    trials: [{
        type: ObjectId,
        ref: 'Trial'
    }],
    arena: {
        type: ObjectId,
        ref: 'Arena',
        childPath: "users"
    },
    user: {
        type: ObjectId,
        ref: 'User',
        childPath: "arenasTried"
    },

});

ArenaTrialSchema.plugin(relationship, {
    relationshipPathName: ['arena', 'user']
});

ArenaTrialSchema.methods.getCompleted = function() {
    return Trial.find({
        arenaTrial: this._id,
        complete: true
    }).exec();
};

var ArenaTrial = mongoose.model('ArenaTrial', ArenaTrialSchema);

var queue = Promise.fulfilled();
var timeout;
observer.on('trial.award', function(trial) {
    if (trial.arenaTrial) 
        queue = queue.then(function(model) {
            return ArenaTrial.findOne({
                _id: trial.arenaTrial
            }).exec().then(function(arenaTrial) {
                arenaTrial.completed += 1;
                if (arenaTrial.trials.length === arenaTrial.completed) {
                    arenaTrial.complete = true;
                }
                arenaTrial.exp += trial.exp;
                return new Promise(function(resolve, reject) {
                    arenaTrial.save(function(err, model) {
                        if (err) return reject(err);
                        if (model.complete) {
                            observer.emit('arenaTrial.complete', model);
                        }
                        observer.emit('arenaTrial.trial.awarded', model);
                        resolve(model);
                    });
                });
            });
        });
});

module.exports = ArenaTrial;
