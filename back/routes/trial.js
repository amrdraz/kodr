var Promise = require('bluebird');
var User = require('../models/user');
var access = require('./access');
var Challenge = require('../models/challenge');
var Arena = require('../models/arena');
var Trial = require('../models/trial');
var ArenaTrial = require('../models/arenaTrial');

module.exports = function(app, passport) {


    /**
     * Find trial by id.
     *
     * @param {string} id
     * @returns {object} trial
     */

    app.get('/api/trials/:id', function(req, res, next) {
        Trial.findById(req.params.id, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(404, "Not Found");
            res.json({
                trial: model
            });
        });
    });

    /**
     * get all trials.
     *
     * @param range
     * @returns {object} trials
     */

    app.get('/api/trials', function(req, res, next) {
        Trial.find(req.query, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(404, "Not Found");
            res.json({
                trial: model
            });
        });
    });

    /**
     * Create new trials.
     *
     * @param range
     * @returns {object} trial
     */

    app.post('/api/trials', access.requireRole(), function(req, res, next) {
        var trial = req.body.trial;
        if (!trial.challenge) return res.send(400, 'you must include a challenge id in your data');
        trial.user = trial.user || req.user.id;
        var promise;
        if (trial.arena && trial.arenaTrial) {
            promise = Trial.findOrCreate(trial);
        } else {
            promise = Promise.fulfilled().then(function() {
                return Challenge.findOne({
                    _id: trial.challenge
                }).exec();
            }).then(function(challenge) {
                if (!challenge) return res.send(403);
                trial.arena = challenge.arena.toString();
                trial.code = challenge.setup;
                return challenge;
            });
            if (trial.arenaTrial) {
                promise.then(function(challenge) {
                    return Trial.findOrCreate(trial);
                });
            } else {
                promise.then(function(challenge) {
                    return ArenaTrial.findOrCreate({arena:challenge.arena,user:trial.user}, true);
                }).spread(function (at) {
                    trial.arenaTrial = at.id;
                    return Trial.findOrCreate(trial);
                });
            }
        }
        promise.then(function(trial) {
            res.json({
                trial: trial
            });
        }).catch(next);
    });

    /**
     * Update new trials.
     *
     * @param range
     * @returns {object} trial
     */

    app.put('/api/trials/:id', access.requireRole({
        roles: [{
            role: 'student',
            in : 'trials'
        }, {
            role: 'teacher',
            all: true
        }, ]
    }), access.requireIn('trials'), function(req, res, next) {
        var trial = req.body.trial;
        trial.time = Date.now();
        trial.times = (trial.times || 0) + 1;
        Trial.findOne({
            _id: req.params.id
        }).exec().then(function(model) {
            if (!model) return res.send(404, "Not Found");
            model.set(trial);
            model.save(function(err, model) {
                if (err) return next(err);
                res.json({
                    trial: model
                });
            });
        }, next);
    });

    /**
     * Delete trial.
     *
     * @param range
     * @returns {status} 200
     */

    app.del('/api/trials/:id', access.requireRole({
        roles: [{
            role: 'student',
            in : 'trials'
        }, {
            role: 'teacher',
            all: true
        }, ]
    }), function(req, res, next) {
        Trial.findById(req.params.id, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(404);
            model.remove(function(err, model) {
                if (err) return next(err);
                res.send(200);
            });
        });
    });

};
