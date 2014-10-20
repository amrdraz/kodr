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

    app.put('/profile', access.requireRole(), function(req, res) {
        
        if (req.body.password !== req.body.passwordConfirmation) {
            return res.send(400, 'Passwords do not match.');
        }
        req.user.set(req.body.user);
        req.user.save(function(err, user) {
            console.log('routes user put profile', err);
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

    app.get('/api/users', access.requireRole(['student', 'teacher', 'admin']), function(req, res, next) {
        var query = req.query;
        if (query.group === "null") {
            query.group = null;
        }
        switch (req.user.role) {
            case 'student': query.role = 'student'; break;
            case 'teacher': query.role = {$in:['student','teacher']}; break;
        }
        User.find().exec().then(function(model) {
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

    app.post('/api/users', access.requireRole(['teacher', 'admin']), function(req, res, next) {
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

    app.put('/api/users/:id', access.requireRole(['$self', 'teacher', 'admin']), function(req, res, next) {
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

    app.del('/api/users/:id', access.requireRole(['teacher', 'admin']), function(req, res, next) {
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
