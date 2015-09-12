var Promise = require('bluebird');
var mongoose = require('mongoose');
var _ = require('lodash');
var observer = require('../observer');

module.exports = exports = function lastModifiedPlugin(schema, options) {
    var Model = options.model || options;
    schema.plugin(require('./_common_helper'), options);

    schema.methods.getCompletedTrials = function() {
        var Trial = mongoose.model('Trial');
        return Promise.fulfilled().then(function() {
            return Trial.find({
                userArena: this._id,
                complete: true
            }).exec();
        });
    };

    /**
     * Get Challenges in this arena
     * @return {Promise} contining array of challanges
     */
    schema.methods.getArenaChallenges = function() {
        var Challenge = mongoose.model('Challenge');
        var doc = this;
        return Promise.fulfilled().then(function() {
            return Challenge.find({
                arena: doc.arena,
            }).sort('order exp').exec();
        });
    };

    /**
     * Find or create an UserArena along with it's associated Trials
     * @param  {hash} userArena arena trial to create requires arena and user
     * @param  {boolean} withoutTrials wether to create trials along with this arena trial
     * @return {Promise} array contianing userArena as first element and trials as second unless withoutTrials is true
     */
    schema.statics.findOrCreateWithTrials = function(userArena) {
        var UserArena = mongoose.model('UserArena');
        var Trial = mongoose.model('Trial');

        return UserArena.getOneByQueryOrCreate({
            user: userArena.user,
            arena: userArena.arena
        }, userArena).then(function(model) {
            var trials = Promise.map(model.getArenaChallenges(), function(challenge) {
                return Trial.findOrCreate({
                    userArena: model._id,
                    arena: model.arena,
                    user: model.user,
                    challenge: challenge._id,
                    order: challenge.order,
                    code: challenge.setup,
                    completed: 0
                });
            });
            var at = trials.then(function(mods) {
                return UserArena.getById(model.id);
            });
            return [at, trials];
        });
    };

};
