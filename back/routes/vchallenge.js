var Promise = require('bluebird');
var User = require('../models/user');
var access = require('./access');
var VChallenge = require('../models/vchallenge');

module.exports = function(app, passport) {
	 /**
     * Find vchallenge by id.
     *
     * @param {string} id
     * @returns {object} vchallenge
     */

    app.get('/api/vchallenges/:id', function(req, res, next) {
        VChallenge.getById_404(req.params.id).then(function(model) {
            res.json({
                vchallenge: model
            });
        }).catch(next);
    });

    /**
     * get all vchallenges.
     *
     * @param range
     * @returns {object} person
     */

    app.get('/api/vchallenges', function(req, res, next) {
        VChallenge.getByQuery(req.query).then(function(model) {
            res.json({
                vchallenge: model
            });
        }).catch(next);
    });

    /**
     * post code.
     *
     * @returns {object} person
     */

    app.post('/api/vchallenges/run', function(req, res, next) {
        VChallenge.run(req.body.code, req.body).spread(function(sterr, stout) {
            res.send({
                sterr: sterr,
                stout: stout
            });
        });
    });

    /**
     * test code.
     *
     * @returns {object} person
     */

    app.post('/api/vchallenges/test', function(req, res, next) {
        VChallenge.test(req.body.code, req.body.vchallenge).spread(function(report, stout, sterr) {
            res.send({
                report: report,
                stout: stout,
                sterr: sterr
            });
        }).catch(function(err) {
            console.log(err);
            res.send(500, err.toString());
        });
    });


    /**
     * Create new vchallenges.
     *
     * @param range
     * @returns {object} person
     */

    app.post('/api/vchallenges', access.requireRole(['teacher', 'admin']), function(req, res, next) {
        req.body.vchallenge.author = req.user.id;
        VChallenge.KCreate(req.body.vchallenge).then(function(model) {
            res.json({
                vchallenge: model
            });
        }).catch(next);
    });

    /**
     * Update new vchallenges.
     *
     * @param range
     * @returns {object} person
     */

    app.put('/api/vchallenges/:id', access.requireRole(['teacher', 'admin']), function(req, res, next) {
        VChallenge.getById_404(req.params.id).then(function(model) {
            model.set(req.body.vchallenge);
            model.save(function(err, model) {
                res.json({
                    vchallenge: model
                });
            });
        }).catch(next);
    });

    /**
     * Delete vchallenge.
     *
     * @param range
     * @returns {status} 200
     */

    app.del('/api/vchallenges/:id', access.requireRole(['teacher', 'admin']), function(req, res, next) {
        VChallenge.getById_404(req.params.id).then(function(model) {
            model.remove(function(err, model) {
                if (err) return next(err);
                res.send(200);
            });
        }).catch(next);
    });
};