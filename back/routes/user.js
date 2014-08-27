var User = require('../models/user');
var access = require('./access');

module.exports = function(app, passport) {

    /**
     * Returns the data for the currently logged in user
     *
     * @returns {object} arenaTrial
     */
    
    app.get('/profile', access.requireRole(), function(req, res) {
        res.json(
            req.user
        );
    });

    app.post('/profile', access.requireRole(), function(req, res) {
        req.user.set(req.body);
        req.user.save(function(err, user) {
            if(err) res.send(500);
            res.json({
                model:user,
                access_token: user.token
            });
        });
    });


    /**
     * Find arenaTrial by id.
     *
     * @param {string} id
     * @returns {object} arenaTrial
     */

    app.get('/api/users/:id', access.requireRole(),function(req, res, next) {
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

    app.get('/api/users', access.requireRole(['student', 'teacher']),function(req, res, next) {
        User.find({}).exec().then(function(model) {
            if (!model) return res.send(404, "Not Found");
            res.json({
                user: model
            });
        },next);
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
            },next);
    });

    /**
     * Update users.
     *
     * @param range
     * @returns {object} user
     */

    app.put('/api/users/:id', access.requireRole(['$self','teacher']), function(req, res, next) {
        var user = req.body.user;
        User.findOne({_id:req.params.id}).exec().then(function(model) {
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
            if(!model) return res.send(404);
            model.remove(function(err, model) {
                if (err) return next(err);
                res.send(200);
            });
        });
    });

};
