var Promise = require('bluebird');
var Group = require('../models/group');
var User = require('../models/user');
var access = require('./access');

module.exports = function(app, passport) {

    /**
     * Find Group by id.
     *
     * @param {string} id
     * @returns {object} Group
     */

    app.get('/api/groups/:id', access.requireRole(['teacher']), function(req, res, next) {
        Promise.fulfilled().then(function() {
            return [
                Group.findOne({
                    _id: req.params.id
                }).exec(),
                User.find({
                    group: req.params.id
                }).exec()
            ];
        }).spread(function(g, mbs) {
            if (!g) return res.send(404, "Not Found");
            res.json({
                group: g,
                members: mbs
            });
        }).catch(next);
    });

    /**
     * get all groups.
     *
     * @param range
     * @returns {object} groups
     */

    app.get('/api/groups', access.requireRole(['teacher']), function(req, res, next) {
        Group.find({}).exec().then(function(model) {
            if (!model) return res.send(404, "Not Found");
            res.json({
                group: model
            });
        }, next);
    });

    /**
     * Create new groups.
     *
     * @param range
     * @returns {object} group
     */

    app.post('/api/groups', access.requireRole(['teacher']), function(req, res, next) {
        req.body.group.founder = req.user._id;
        Group.create(req.body.group)
            .then(function(model) {
                res.json({
                    group: model,
                });
            }, next);
    });

    /**
     * Update groups.
     *
     * @param range
     * @returns {object} group
     */

    app.put('/api/groups/:id', access.requireRole(['teacher']), function(req, res, next) {
        var group = req.body.group;
        Group.findOne({
            _id: req.params.id
        }).exec().then(function(model) {
            if (!model) return res.send(404, "Not Found");
            model.set(group);
            model.save(function(err, model) {
                if (err) return next(err);
                res.json({
                    group: model
                });
            });
        }, next);
    });

    /**
     * Delete group.
     *
     * @param range
     * @returns {status} 200
     */

    app.del('/api/groups/:id', access.requireRole(['teacher']), function(req, res, next) {
        Group.findById(req.params.id, function(err, model) {
            if (err) return next(err);
            if(!model) return res.send(404);
            model.remove(function(err, model) {
                if (err) return next(err);
                res.send(200);
            });
        });
    });

};
