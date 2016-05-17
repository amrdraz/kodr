var Promise = require('bluebird');
var User = require('../models/user');
var access = require('./access');
var UserConcept = require('../models/userConcept');

module.exports = function(app, passport) {


    /**
     * Find challenge by id.
     *
     * @param {string} id
     * @returns {object} challenge
     */

    app.get('/api/userConcepts/:id', function(req, res, next) {
        UserConcept.getById_404(req.params.id).then(function(model) {
            res.json({
                userConcept: model
            });
        }).catch(next);
    });

    /**
     * get all userConcepts.
     *
     * @param range
     * @returns {object} challenge
     */

    app.get('/api/userConcepts', function(req, res, next) {
        console.log(req.query)
        UserConcept.getByQuery(req.query).then(function(model) {
            console.log(model)
            res.json({
                userConcept: model
            });
        }).catch(next);
    });

    /**
     * Update new userConcepts.
     *
     * @param range
     * @returns {object} person
     */

    app.put('/api/userConcepts/:id', access.requireRole(), function(req, res, next) {
        UserConcept.getById_404(req.params.id).then(function(model) {
            // console.log(req.body)
            model.set(req.body.userConcept);
            model.save(function(err, model) {
                console.log(model)
                res.json({
                    userConcept: model
                });
            });
        }).catch(next);
    });

    /**
     * Delete UserConcept.
     *
     * @param range
     * @returns {status} 200
     */

    app.del('/api/userConcepts/:id', access.requireRole(['teacher', 'admin']), function(req, res, next) {
        UserConcept.getById_404(req.params.id).then(function(model) {
            model.remove(function(err, model) {
                if (err) return next(err);
                res.send(204);
            });
        }).catch(next);
    });

};
