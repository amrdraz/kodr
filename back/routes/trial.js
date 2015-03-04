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
        Trial.getById(req.params.id).then(function(model) {
            res.json({
                trial: model
            });
        }).catch(next);
    });

    /**
     * get all trials.
     *
     * @param range
     * @returns {object} trials
     */

    app.get('/api/trials', function(req, res, next) {
        Trial.getByQuery(req.query).then(function (model) {
            res.json({
                trial: model
            });
        }).catch(next);
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
        Trial.findOrCreate(trial).then(function(trial) {
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
        }, {
            role: 'admin',
            all: true
        }, ]
    }), function(req, res, next) {
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
        }, {
            role: 'admin',
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
