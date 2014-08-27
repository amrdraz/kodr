var mongoose = require('mongoose');
var Promise = require('bluebird');
var debounce = require('debounce');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
var relationship = require("mongoose-relationship");
var observer = require('../mediator');
var Trial = require("./trial");
var Challenge = require("./challenge");

/**
 * Arena User Schema.
 * This model holds information about user preformance inside a particular arena
 * alows us to form metrics such as how many challenges did he solve, experiance gained here
 * and anything related to user and arena
 *
 * @attribute exp           Number      The amount of experiance gained per challenge
 * @attribute complete      Boolean     Whether Arena was complete or not
 * @attribute completed     Number      number of trials completed
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

ArenaTrialSchema.methods.getCompletedTrials = function() {
    return Trial.find({
        arenaTrial: this._id,
        complete: true
    }).exec();
};

/**
 * Get Challenges in this arena
 * @return {Promise} contining array of challanges
 */
ArenaTrialSchema.methods.getArenaChallenges = function() {
    return Challenge.find({
        arena: this.arena,
    }).sort('exp').exec();
};

/**
 * Find ir create an ArenaTrial along with it's associated Trials
 * @param  {hash} arenaTrial arena trial to create requires arena and user
 * @return {Promise}         array contianing arenaTrial as first element and trials as second
 */
ArenaTrialSchema.statics.findOrCreate = function(arenaTrial) {
    return Promise.fulfilled().then(function() {
        return ArenaTrial.findOne({
            user: arenaTrial.user,
            arena: arenaTrial.arena
        }).exec().then(function(model) {
            if (model) return Promise.resolve(model);
            return ArenaTrial.create(arenaTrial);
        });
    }).then(function(model) {
        var trials = Promise.map(model.getArenaChallenges(), function(challenge) {
            return Trial.findOrCreate({
                arenaTrial: model._id,
                user: model.user,
                challenge: challenge._id,
                code: challenge.setup
            });
        });
        var at = trials.then(function(mods) {
            return ArenaTrial.findOne({
                _id: model._id
            }).exec();
        });
        return [at, trials];
    });
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
