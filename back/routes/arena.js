var Promise = require('bluebird');
var User = require('../models/user');
var access = require('./access');
var Arena = require('../models/arena');
var Challenge = require('../models/challenge');

module.exports = function(app, passport) {


    /**
     * Find arena by id.
     *
     * @param {string} id
     * @returns {object} arena
     */

    app.get('/api/arenas/:id', function(req, res, next) {
        Arena.getByIdWithChallanges(req.params.id)
        .spread(function(arena, challenges) {
            res.json({
                arena: arena,
                challenges: challenges
            });
        }).catch(next);
    });

    /**
     * get all arenas.
     *
     * @param range
     * @returns {object} person
     */

    app.get('/api/arenas', function(req, res, next) {
        if(req.query.ids) {
            req.query._id = {$in:req.query.ids};
            delete req.query.ids;
        }
        Arena.find(req.query, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(404, "Not Found");
            res.json({
                arena: model
            });
        });
    });

    /**
     * Create new arenas.
     *
     * @param range
     * @returns {object} person
     */

    app.post('/api/arenas', access.requireRole(['teacher','admin']), function(req, res, next) {
        req.body.arena.author = req.user.id;
        Arena.create(req.body.arena, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(403, "Not Found");
            res.json({
                arena: model
            });
        });
    });

    /**
     * Update new arenas.
     *
     * @param range
     * @returns {object} person
     */

    app.put('/api/arenas/:id', access.requireRole(['teacher','admin']), function(req, res, next) {
        Arena.findByIdAndUpdate(req.params.id, req.body.arena, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(404, "Not Found");
            res.json({
                arena: model
            });
        });
    });

    /**
     * Delete arena.
     *
     * @param range
     * @returns {status} 200
     */

    app.del('/api/arenas/:id', access.requireRole(['teacher','admin']), function(req, res, next) {
        Arena.findById(req.params.id, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(404);
            model.remove(function(err, model) {
                if (err) return next(err);
                res.send(200);
            });
        });
    });

};
