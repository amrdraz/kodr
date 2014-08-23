var User = require('../models/user');
var access = require('./access');
var Challenge = require('../models/challenge');
var ArenaTrial = require('../models/arenaTrial');

module.exports = function(app, passport) {


    /**
     * Find arenaTrial by id.
     *
     * @param {string} id
     * @returns {object} arenaTrial
     */

    app.get('/api/arenaTrials/:id', access.hasToken, function(req, res, next) {
        ArenaTrial.findById(req.params.id, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(404, "Not Found");
            res.json({
                arenaTrial: model
            });
        });
    });

    /**
     * get all arenaTrials.
     *
     * @param range
     * @returns {object} arenaTrials
     */

    app.get('/api/arenaTrials', access.hasToken, function(req, res, next) {
        var arena = req.query.arena;
        if (arena) {
            ArenaTrial.findOrCreate({user:req.user.id,arena:arena})
                .spread(function(model, trials) {
                    res.json({
                        arenaTrial: model,
                        trials: trials
                    });
                }).catch(next);
        } else {
            ArenaTrial.find(req.params, function(err, model) {
                if (err) return next(err);
                if (!model) return res.send(404, "Not Found");
                res.json({
                    arenaTrial: model
                });
            });
        }
    });

    /**
     * Create new arenaTrials.
     *
     * @param range
     * @returns {object} arenaTrial
     */

    app.post('/api/arenaTrials', access.hasToken, function(req, res, next) {
        req.body.arenaTrial.user = req.user.id;
        ArenaTrial.findOrCreate(req.body.arenaTrial)
            .spread(function(model, trials) {
                res.json({
                    arenaTrial: model,
                    trials: trials
                });
            }).catch(next);
    });

    /**
     * Update new arenaTrials.
     *
     * @param range
     * @returns {object} arenaTrial
     */

    app.put('/api/arenaTrials/:id', access.hasToken, function(req, res, next) {
        var arenaTrial = req.body.arenaTrial;
        arenaTrial.time = Date.now();
        arenaTrial.times = (arenaTrial.times || 0) + 1;
        ArenaTrial.findById(req.params.id, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(404, "Not Found");
            model.set(arenaTrial);
            model.save(function(err, model) {
                if (err) return next(err);
                res.json({
                    arenaTrial: model
                });
            });
        });
    });

    /**
     * Delete arenaTrial.
     *
     * @param range
     * @returns {status} 200
     */

    app.del('/api/arenaTrials/:id', access.hasToken, function(req, res, next) {
        ArenaTrial.findById(req.params.id, function(err, model) {
            if (err) return next(err);
            if(!model) res.send(200);
            model.remove(function(err, model) {
                if (err) return next(err);
                res.send(200);
            });
        });
    });

};
