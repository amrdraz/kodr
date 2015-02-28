var Promise = require('bluebird');
var User = require('../models/user');
var access = require('./access');
var Challenge = require('../models/challenge');

module.exports = function(app, passport) {


    /**
     * Find challenge by id.
     *
     * @param {string} id
     * @returns {object} challenge
     */

    app.get('/api/challenges/:id', function(req, res, next) {
        Challenge.getById_404(req.params.id).then(function(model) {
            res.json({
                challenge: model
            });
        }).catch(next);
    });

    /**
     * get all challenges.
     *
     * @param range
     * @returns {object} person
     */

    app.get('/api/challenges', function(req, res, next) {
        Challenge.getByQuery(req.query).then(function(model) {
            res.json({
                challenge: model
            });
        }).catch(next);
    });

    /**
     * post code.
     *
     * @returns {object} person
     */

    app.post('/api/challenges/run', function(req, res, next) {
        Challenge.run(req.body.code, req.body).spread(function(sterr, stout) {
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

    app.post('/api/challenges/test', function(req, res, next) {
        Challenge.test(req.body.code, req.body.challenge).spread(function(report, stout, sterr) {
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
     * Create new challenges.
     *
     * @param range
     * @returns {object} person
     */

    app.post('/api/challenges', access.requireRole(['teacher', 'admin']), function(req, res, next) {
        req.body.challenge.author = req.user.id;
        Challenge.KCreate(req.body.challenge).then(function(model) {
            res.json({
                challenge: model
            });
        }).catch(next);
    });

    /**
     * Update new challenges.
     *
     * @param range
     * @returns {object} person
     */

    app.put('/api/challenges/:id', access.requireRole(['teacher', 'admin']), function(req, res, next) {
        Challenge.getById_404(req.params.id).then(function(model) {
            model.set(req.body.challenge);
            model.save(function(err, model) {
                res.json({
                    challenge: model
                });
            });
        }).catch(next);
    });

    /**
     * Delete challenge.
     *
     * @param range
     * @returns {status} 200
     */

    app.del('/api/challenges/:id', access.requireRole(['teacher', 'admin']), function(req, res, next) {
        Challenge.getById_404(req.params.id).then(function(model) {
            model.remove(function(err, model) {
                if (err) return next(err);
                res.send(200);
            });
        }).catch(next);
    });

};
