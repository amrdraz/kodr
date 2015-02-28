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
                arenaTrial: this._id,
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
     * Find or create an ArenaTrial along with it's associated Trials
     * @param  {hash} arenaTrial arena trial to create requires arena and user
     * @param  {boolean} withoutTrials wether to create trials along with this arena trial
     * @return {Promise} array contianing arenaTrial as first element and trials as second unless withoutTrials is true
     */
    schema.statics.findOrCreate = function(arenaTrial, withoutTrials) {
        var ArenaTrial = mongoose.model('ArenaTrial');
        var Trial = mongoose.model('Trial');

        var promise = ArenaTrial.getOneByQueryOrCreate({
            user: arenaTrial.user,
            arena: arenaTrial.arena
        }, arenaTrial);

        if (withoutTrials) {
            return [promise];
        } else {
            return promise.then(function(model) {
                var trials = Promise.map(model.getArenaChallenges(), function(challenge) {
                    return Trial.findOrCreate({
                        arenaTrial: model._id,
                        arena: model.arena,
                        user: model.user,
                        challenge: challenge._id,
                        code: challenge.setup,
                        completed: 0
                    });
                });
                var at = trials.then(function(mods) {
                    return ArenaTrial.getById(model.id);
                });
                return [at, trials];
            });
        }
    };

};
