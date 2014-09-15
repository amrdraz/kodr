var Promise = require('bluebird');
var User = require('../models/user');
var UserQuest = require('../models/userQuest');
var access = require('./access');

module.exports = function(app, passport) {

    /**
     * Returns the data for the currently logged in user
     *
     * @returns {object} User
     */

    app.get('/profile', access.requireRole(), function(req, res) {
        Promise.fulfilled().then(function() {
            return [UserQuest.find({
                user: req.user.id
            }).exec()];
        }).spread(function(uqs) {
            res.send({
                user: req.user,
                userQuests: uqs
            });
        });
    });

    app.post('/profile', access.requireRole(), function(req, res) {
        req.user.set(req.body);
        req.user.save(function(err, user) {
            if (err) res.send(500);
            res.json({
                user: user,
                access_token: user.token
            });
        });
    });


    /**
     * Find User by id.
     *
     * @param {string} id
     * @returns {object} User
     */

    app.get('/api/users/:id', access.requireRole(), function(req, res, next) {
        User.findById(req.params.id, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(404, "Not Found");
            res.json({
                user: model
            });
        });
    });

    /**
     * get all users.
     *
     * @param range
     * @returns {object} users
     */

    app.get('/api/users', access.requireRole(['student', 'teacher']), function(req, res, next) {
        if (req.query.group === "null") {
            req.query.group = null;
        }
        User.find(req.query).exec().then(function(model) {
            if (!model) return res.send(404, "Not Found");
            res.json({
                user: model
            });
        }, next);
    });

    /**
     * Create new users.
     *
     * @param range
     * @returns {object} user
     */

    app.post('/api/users', access.requireRole(['teacher']), function(req, res, next) {
        User.create(req.body.user)
            .then(function(model) {
                res.json({
                    user: model,
                });
            }, next);
    });

    /**
     * Update users.
     *
     * @param range
     * @returns {object} user
     */

    app.put('/api/users/:id', access.requireRole(['$self', 'teacher']), function(req, res, next) {
        var user = req.body.user;
        User.findOne({
            _id: req.params.id
        }).exec().then(function(model) {
            if (!model) return res.send(404, "Not Found");
            model.set(user);
            model.save(function(err, model) {
                if (err) return next(err);
                res.json({
                    user: model
                });
            });
        }, next);
    });

    /**
     * Delete user.
     *
     * @param range
     * @returns {status} 200
     */

    app.del('/api/users/:id', access.requireRole(['teacher']), function(req, res, next) {
        User.findById(req.params.id, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(404);
            model.remove(function(err, model) {
                if (err) return next(err);
                res.send(200);
            });
        });
    });

};
