var Promise = require('bluebird');
var Wiki = require('../models/wiki');
var ExpiringToken = require('../models/expiringToken');
var access = require('./access');
var observer = require('../observer');
var ObjectId = require('mongoose').Schema.Types.ObjectId;

module.exports = function(app, passport) {

    /**
     * Find Wiki by id.
     *
     * @param {string} id
     * @returns {object} Wiki
     */

    app.get('/api/wikis/:id', function(req, res, next) {
        Wiki
            .findById(req.params.id)
            .select('')
            .exec(function(err, model) {
                if (err) return next(err);
                if (!model) return res.send(404, "Not Found");
                res.json({
                    wiki: model
                });
            });
    });

    /**
     * get all wikis.
     *
     * @param
     * @returns {object} wikis
     */

    app.get('/api/wikis', function(req, res, next) {
        Wiki.find(req.query)
            .select('')
            .exec()
            .then(function(model) {
                if (!model) return res.send(404, "Not Found");
                res.json({
                    wikis: model
                });
            }, next);
    });

    /**
     * Create new wiki.
     *
     * @param range
     * @returns {object} wiki
     */

    app.post('/api/wikis', access.requireRole(), function(req, res, next) {
        var wiki = req.body.wiki;
        wiki.author = wiki.user || req.user.id;
        wiki = new Wiki(wiki);
        wiki.save(function(err, model) {
            if (err)
                next(err);
            res.json({
                wiki: model
            });
        });
    });

    /**
     * Update an existing wiki.
     *
     * @param wiki id
     * @returns {object} wiki
     */

    app.put('/api/wikis/:id', access.requireRole(), function(req, res, next) {
        Wiki.findById(req.params.id, function(err, wiki) {
            if (!wiki)
                return next(new Error('Could find the Wiki'));
            else {
                if (req.user._id.toString() === wiki.author.toString()) {
                    wiki.set(req.body.wiki);
                    wiki.save(function(err, model) {
                        if (err)
                            next(err);
                        res.json({
                            wiki: model
                        });
                    });
                } else {
                    // Unauthorized
                    return res.send(401, "Unauthorized");
                }
            }
        });
    });

    /**
     * Delete an existing wiki.
     *
     * @param   wiki id
     * @return
     */

    app.delete('/api/wikis/:id', access.requireRole(), function(req, res, next) {
        Wiki.findById(req.params.id, function(err, wiki) {
            if (!wiki)
                return next(new Error('Could find the Wiki'));
            else {
                if (req.user._id.toString() === wiki.author.toString()) {
                    wiki.remove(function(err) {
                        if (err)
                            return next(err);
                        res.send(204)
                    });
                } else {
                    return res.send(401, "Unauthorized");
                }
            }
        });
    });



};
