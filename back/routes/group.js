var Promise = require('bluebird');
var _ = require('lodash');
var Group = require('../models/group');
var User = require('../models/user');
var access = require('./access');

module.exports = function(app, passport) {
    
    /**
     * Find teachers that can be part of this group.
     *
     * @param {string} id
     * @returns {object} Users
     */

    app.get('/api/groups/groupOptions', access.requireRole(), function(req, res, next) {
        Group.getGroups(req.user.id).then(function (groups) {
            return Group.find({group:{$nin: _.map(groups, 'id')}}, '_id name').exec();
        }).then(function(groups) {
            res.send(groups);
        }).catch(next);
    });

    /**
     * Find teachers that can be part of this group.
     *
     * @param {string} id
     * @returns {object} Users
     */

    app.get('/api/groups/:id/teacherOptions', access.requireRole(['teacher', 'admin']), function(req, res, next) {
        Group.getMembers().then(function(memebrs) {
            return User.find({
                role: 'teacher',
                _id: {
                    $nin: _.map(memebrs, 'user')
                }
            }, '_id username').exec();
        }).then(function(mbs) {
            res.json(mbs);
        }).catch(next);
    });

    /**
     * Find students that can be part of this group.
     *
     * @param {string} id
     * @returns {object} Users
     */

    app.get('/api/groups/:id/studentOptions', access.requireRole(['teacher', 'admin']), function(req, res, next) {
        Group.getMembers().then(function(memebrs) {
            return User.find({
                role: 'student',
                _id: {
                    $nin: _.map(memebrs, 'user')
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

    app.get('/api/groups/:id', access.requireRole(['teacher', 'admin']), function(req, res, next) {
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

    app.get('/api/groups', access.requireRole(['student', 'teacher', 'admin']), function(req, res, next) {
        if (req.user.isAdmin) {
            Group.find(req.query).exec().then(function(model) {
                if (!model) return res.send(404, {
                    message: "Not Found"
                });
                res.json({
                    group: model
                });
            }, next);
        } else {
            Group.getGroups(req.user).then(function(groups) {
                res.send({
                    group: groups
                });
            });
        }
    });

    /**
     * Create new group.
     *
     * @param range
     * @returns {object} group
     */

    app.post('/api/groups', access.requireRole(['admin']), function(req, res, next) {
        if (req.body.group) {
            Group.create(req.body.group).then(function(model) {
                res.json({
                    group: model
                });
            });
        } else {
            res.send(304, "You sent nothing");
        }
    });
    /**
     * Create new group.
     *
     * @param range
     * @returns {object} group
     */

    app.post('/api/groups/many', access.requireRole(['admin']), function(req, res, next) {
        Promise.map(_.range(+req.body.from, (+req.body.to) + 1), function(i) {
            return Group.findOrCreateByName(req.body.name + " " + ((i > 0 && i < 10) ? '0' : '') + i);
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
            return [model, model.join(req.user)];
        }).spread(function(model, member) {
            res.json({
                user:req.user,
                group: model,
                member: member
            });
        }).catch(function(err) {
            if (err.http_code) return res.send(err.http_code, err.message);
            next(err);
        });
    });

    /**
     * Add memebr to group.
     *
     * @param range
     * @returns {status} 204
     */

    app.post('/api/groups/:id/members/:uid', access.requireRole(['teacher', 'admin']), function(req, res, next) {
        Group.addMember(req.params.id, req.params.uid).spread(function(group, member) {
            res.send({
                group: group,
                member: member
            });
        }).catch(function(err) {
            if (err.http_code) return res.send(err.http_code, err.message);
            next(err);
        });
    });


    /**
     * Add memebrs to group.
     *
     * @param range
     * @returns {status} 204
     */

    app.post('/api/groups/:id/members', access.requireRole(['teacher', 'admin']), function(req, res, next) {
        Group.addMembers(req.params.id, req.body.uids).spread(function(group, members) {
            res.send({
                group: group,
                members: members
            });
        }).catch(function(err) {
            console.log(err);
            if (err.http_code) return res.send(err.http_code, err.message);
            next(err);
        });
    });

    /**
     * Update groups.
     *
     * @param range
     * @returns {object} group
     */

    app.put('/api/groups/:id', access.requireRole(['teacher', 'admin']), function(req, res, next) {
        var group = req.body.group;
        Group.getById_404(req.params.id).then(function(model) {
            return model.canUpdate(req.user).then(function(member) {
                return model;
            });
        }).then(function(model) {
            model.set(group);
            model.save(function(err, model) {
                if (err) return next(err);
                res.json({
                    group: model
                });
            });
        }).catch(function(err) {
            if (err.http_code) return res.send(err.http_code, err.message);
            next(err);
        });
    });

    /**
     * join group by adding user as member.
     *
     * @param range
     * @returns {object} group
     */

    app.put('/api/groups/:id/leave', access.requireRole(), function(req, res, next) {
        Group.getById_404(req.params.id).then(function(model) {
            return [model, model.leave(req.user)];
        }).spread(function(model, member) {
            res.json({
                group: model,
                member: member
            });
        });
    });

    /**
     * Delete group.
     *
     * @param range
     * @returns {status} 204
     */

    app.del('/api/groups/:id/members/:uid', access.requireRole(['teacher', 'admin']), function(req, res, next) {
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
        }).catch(function(err) {
            if (err.http_code) return res.send(err.http_code, err.message);
            next(err);
        });
    });

};
