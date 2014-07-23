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
        Challenge.findById(req.params.id, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(404, "Not Found");
            res.json({challenge:model});
        });
    });

     /**
     * get all challenges.
     *
     * @param range
     * @returns {object} person
     */

    app.get('/api/challenges', function(req, res, next) {
        Challenge.find({}, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(404, "Not Found");
            res.json({challenge:model});
        });
    });

    /**
     * Create new challenges.
     *
     * @param range
     * @returns {object} person
     */

    app.post('/api/challenges', access.hasToken,function(req, res, next) {
        req.body.challenge.author = req.user.id;
        Challenge.create(req.body.challenge, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(403, "Not Found");
            res.json({challenge:model});
        });
    });

    /**
     * Update new challenges.
     *
     * @param range
     * @returns {object} person
     */

    app.put('/api/challenges/:id', access.hasToken,function(req, res, next) {
        Challenge.findByIdAndUpdate(req.params.id,req.body.challenge, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(404, "Not Found");
            res.json({challenge:model});
        });
    });

    /**
     * Delete challenge.
     *
     * @param range
     * @returns {status} 200
     */

    app.del('/api/challenges/:id', access.hasToken,function(req, res, next) {
        Challenge.findByIdAndRemove(req.params.id, function(err, model) {
            if (err) return next(err);
            res.send(200);
        });
    });

};
