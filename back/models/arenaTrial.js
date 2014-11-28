var mongoose = require('mongoose');
var Promise = require('bluebird');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
var relationship = require("mongoose-relationship");
var observer = require('../observer');
var Challenge = require("./challenge");
var Trial = require("./trial");

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
    completeTime: {
        type: Date
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
 * @param  {boolean} withoutTrials wether to create trials along with this arena trial
 * @return {Promise} array contianing arenaTrial as first element and trials as second unless withoutTrials is true
 */
ArenaTrialSchema.statics.findOrCreate = function(arenaTrial,withoutTrials) {
    var promise = Promise.fulfilled().then(function() {
        return ArenaTrial.findOne({
            user: arenaTrial.user,
            arena: arenaTrial.arena
        }).exec().then(function(model) {
            if (model) return Promise.resolve(model);
            return ArenaTrial.create(arenaTrial);
        });
    });
    if(withoutTrials) {
        return [promise];
    } else {
        return promise.then(function(model) {
            var trials = Promise.map(model.getArenaChallenges(), function(challenge) {
                return Trial.findOrCreate({
                    arenaTrial: model._id,
                    arena: model.arena,
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
    }
};

var ArenaTrial = module.exports = mongoose.model('ArenaTrial', ArenaTrialSchema);

var queue = Promise.fulfilled();
var timeout;
observer.on('trial.award', function(trial) {
    if (trial.arenaTrial)
        queue = queue.then(function(model) {
            return ArenaTrial.findOneAndUpdate({
                _id: trial.arenaTrial
            }, {
                $inc: {
                    completed: 1,
                    exp: trial.exp
                }
            }, {unset:true}).exec().then(function(arenaTrial) {
                if (arenaTrial.trials.length === arenaTrial.completed) {
                    arenaTrial.complete = true;
                    arenaTrial.completeTime = Date.now();
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
                }
                observer.emit('arenaTrial.trial.awarded', arenaTrial);
                return arenaTrial;
            });
        });
});
