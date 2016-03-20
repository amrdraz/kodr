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
};
