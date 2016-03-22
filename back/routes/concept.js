var Promise = require('bluebird');
var User = require('../models/user');
var access = require('./access');
var Concept = require('../models/concept');

module.exports = function(app, passport) {


	/**
     * Find concept by id.
     *
     * @param {string} id
     * @returns {object} concept
     */

	app.get('/api/concepts/:id', function(req, res, next) {
		Concept.getById_404(req.params.id).then(function(model) {
			res.json({
				concept: model
			});
		}).catch(next);
	});

	/**
     * Get all concepts.
     *
     * @param range
     * @returns {object} concept
     */

	app.get('/api/concepts', function(req, res, next) {
		Concept.getByQuery(req.query).then(function(model) {
			res.json({
				concept: model
			});
		}).catch(next);
	});

	/**
     * Create new concepts.
     *
     * @param range
     * @returns {object} concept
     */

    app.post(
			'/api/concepts', access.requireRole(['teacher', 'admin']),
			function(req, res, next) {
        req.body.concept.author = req.user.id;
        Concept.findOrCreate(req.body.concept).then(function(model) {
            res.json({
                concept: model
            });
        }).catch(next);
    });

		/**
     * Delete concept.
     *
     * @param range
     * @returns {status} 204
     */

    app.del('/api/concepts/:id', access.requireRole(['teacher', 'admin']), function(req, res, next) {
        Concept.getById_404(req.params.id).then(function(model) {
						model.removeConcept();
            model.remove(function(err, model) {
                if (err) return next(err);
                res.send(204);
            });
        }).catch(next);
    });
}
