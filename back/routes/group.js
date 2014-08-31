var Promise = require('bluebird');
var _ = require('lodash');
var Group = require('../models/group');
var User = require('../models/user');
var access = require('./access');

module.exports = function(app, passport) {
    /**
     * Find users that can be part of this group.
     *
     * @param {string} id
     * @returns {object} Users
     */

    app.get('/api/groups/:id/membersOptions', access.requireRole(['teacher']), function(req, res, next) {
        Promise.fulfilled().then(function() {
            return User.find({
                role: 'student',
                group: {
                    $exists: false
                }
            }, '_id username').exec();
        }).then(function(mbs) {
            res.json(mbs);
        }).catch(next);
    });

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
                users: mbs
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
        Group.find(req.query).exec().then(function(model) {
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
                User.find({
                    group: model.id
                }).exec().then(function(users) {
                    res.json({
                        group: model,
                        users: users
                    });
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
                User.find({
                    group: model.id
                }).exec().then(function(users) {
                    res.json({
                        group: model,
                        users: users
                    });
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

    app.del('/api/groups/:id/members/:uid', access.requireRole(['teacher']), function(req, res, next) {
        Promise.fulfilled().then(function() {
            return [Group.findOne({
                _id: req.params.id
            }).exec(), User.update({
                _id: req.params.uid,
            }, {$unset: {group:1}}).exec()];
        }).spread(function(group) {
            group.members = _.filter(group.members,function (m) {
                return !m.equals(req.params.uid);
            });
            group.save(function (err, model) {
                if(err) return next(err);
                res.send(200);
            });
        }).catch(next);
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
            if (!model) return res.send(404);
            model.remove(function(err, model) {
                if (err) return next(err);
                res.send(200);
            });
        });
    });

};
