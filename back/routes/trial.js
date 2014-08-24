var User = require('../models/user');
var access = require('./access');
var Challenge = require('../models/challenge');
var Trial = require('../models/trial');

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
        Trial.find({}, function(err, model) {
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

    app.post('/api/trials', access.hasToken, function(req, res, next) {
        req.body.trial.user = req.user.id;
        Trial.findOrCreate(req.body.trial)
            .then(function(model) {
                res.json({
                    trial: model
                });
            }).catch(next);
    });

    /**
     * Update new trials.
     *
     * @param range
     * @returns {object} trial
     */

    app.put('/api/trials/:id', access.hasToken, function(req, res, next) {
        var trial = req.body.trial;
        trial.time = Date.now();
        trial.times = (trial.times || 0) + 1;
        Trial.findOne({_id:req.params.id}).exec().then(function(model) {
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

    app.del('/api/trials/:id', access.hasToken, function(req, res, next) {
        Trial.findById(req.params.id, function(err, model) {
            if (err) return next(err);
            if(!model) return res.send(200);
            model.remove(function(err, model) {
                if (err) return next(err);
                res.send(200);
            });
        });
    });

};
