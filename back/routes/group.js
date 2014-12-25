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

    app.get('/api/groups/:id/membersOptions', access.requireRole(['teacher','admin']), function(req, res, next) {
        Promise.fulfilled().then(function() {
            return User.find({
                role: 'student',
                membership: {
                    $nin: {group:req.params.id}
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

    app.get('/api/groups/:id', access.requireRole(['teacher','admin']), function(req, res, next) {
        Group.getWithMembers(req.params.id).spread(function(g, mbs) {
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

    app.get('/api/groups', access.requireRole(['teacher','admin']), function(req, res, next) {
        Group.find(req.query).exec().then(function(model) {
            if (!model) return res.send(404, {message:"Not Found"});
            res.json({
                group: model
            });
        }, next);
    });

    /**
     * Create new group.
     *
     * @param range
     * @returns {object} group
     */

    app.post('/api/groups', access.requireRole(['admin']), function(req, res, next) {
        Group.create(req.body.group).then(function(model) {
            res.json({
                group: model
            });
        });
    });

    /**
     * Create multiple groups.
     *
     * @param range
     * @returns {[groups]}
     */

    app.post('/api/groups', access.requireRole(['admin']), function(req, res, next) {
        Promise.map(req.body.groups, function (group) {
            return Group.create(group);
        }).then(function(models) {
            res.json({
                groups: models,
            });
        });
    });

    /**
     * join group by adding user as member.
     *
     * @param range
     * @returns {object} group
     */

    app.post('/api/groups/:id/join', access.requireRole(), function(req, res, next) {
        Group.getById_404(req.params.id).then(function(model) {
            return [model,model.join(req.user)];
        }).spread(function (model, member) {
            res.json({
                group: model,
                member:member
            });
        });
    });

    /**
     * Update groups.
     *
     * @param range
     * @returns {object} group
     */

    app.put('/api/groups/:id', access.requireRole(['teacher','admin']), function(req, res, next) {
        var group = req.body.group;
        Group.getById_404(req.params.id).then(function(model) {
            return model.canUpdate(req.user).then(function (member) {
                return model;
            });
        }).then(function (model) {
            model.set(group);
            model.save(function(err, model) {
                if (err) return next(err);
                res.json({
                    group: model
                });
            });
        }).catch(function (err) {
            if(err.http_code) return res.send(err.http_code, err.message);
            next(err);
        });
    });

    /**
     * Delete group.
     *
     * @param range
     * @returns {status} 204
     */

    app.del('/api/groups/:id/members/:uid', access.requireRole(['admin']), function(req, res, next) {
        Group.removeMember(req.params.id, req.params.uid).then(function(group) {            
            res.send(204);
        }).catch(next);
    });

    /**
     * Delete group.
     *
     * @param range
     * @returns {status} 204
     */

    app.del('/api/groups/:id', access.requireRole(['admin']), function(req, res, next) {
        Group.getById_404(req.params.id).then(function(model) {
            model.remove(function(err, model) {
                if (err) return next(err);
                res.send(204);
            });
        }).catch(function (err) {
            if(err.http_code) return res.send(err.http_code, err.message);
            next(err);
        });
    });

};
