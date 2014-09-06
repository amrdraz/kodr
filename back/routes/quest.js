var Promise = require('bluebird');
var _ = require('lodash');
var Group = require('../models/group');
var Quest = require('../models/quest');
var UserQuest = require('../models/userQuest');
var User = require('../models/user');
var access = require('./access');

module.exports = function(app, passport) {

    /**
     * Find users that can take part in this quest.
     *
     * @param {string} id
     * @returns {object} Users
     */

    app.get('/api/quests/:id/unassignedUsersOptions', access.requireRole(['teacher']), function(req, res, next) {
        Promise.fulfilled().then(function() {
            return Quest.findOne({
                _id: req.params.id
            }).exec();
        }).then(function(quest) {
            if (!quest) res.send(404);
            return User.find({
                role: 'student',
                userQuests: {
                    $nin: quest.userQuests
                }
            }).exec();
        }).then(function(mbs) {
            res.json(mbs);
        }).catch(next);
    });

    /**
     * Find Quest by id.
     *
     * @param {string} id
     * @returns {object} Quest
     */

    app.get('/api/quests/:id', access.requireRole(), function(req, res, next) {
        Promise.fulfilled().then(function() {
            return [
                Quest.findOne({
                    _id: req.params.id
                }).exec(),
                UserQuest.find({
                    quest: req.params.id
                }).exec()
            ];
        }).spread(function(q, uqs) {
            var arr = [q, uqs];
            if (req.user.role === 'teacher') {
                arr.push(User.find({
                    userQuests: {
                        $in: q.userQuests
                    }
                }).exec());
            }
            return arr;
        }).spread(function(q, uqs, users) {
            if (!q) return res.send(404, "Not Found");
            res.json({
                quest: q,
                userQuests: uqs,
                users: users
            });
        }).catch(next);
    });


    /**
     * get all quests.
     *
     * @param range
     * @returns {object} quests
     */

    app.get('/api/quests', access.requireRole(['teacher']), function(req, res, next) {
        Quest.find(req.query).exec().then(function(model) {
            if (!model) return res.send(404, "Not Found");
            res.json({
                quest: model
            });
        }, next);
    });

    /**
     * Create new quests.
     *
     * @param range
     * @returns {object} quest
     */

    app.post('/api/quests', access.requireRole(['teacher']), function(req, res, next) {
        req.body.quest.founder = req.user._id;
        Quest.create(req.body.quest)
            .then(function(model) {
                res.json({
                    quest: model,
                });
            }, next);
    });


    /**
     * Update quests.
     *
     * @param range
     * @returns {object} quest
     */

    app.put('/api/quests/:id', access.requireRole(['teacher']), function(req, res, next) {
        var quest = req.body.quest;
        Promise.fulfilled().then(function() {
            return Quest.findOne({
                _id: req.params.id
            }).exec();
        }).then(function(model) {
            if (!model) return res.send(404, "Not Found");
            model.set(quest);
            model.save(function(err, model) {
                if (err) return next(err);
                res.json({
                    quest: model,
                });
            });
        }).catch(next);
    });

    /**
     * Assign quest to users or group.
     *
     * @param users array of user ids
     * @returns {object} quest
     */

    app.put('/api/quests/:id/assign', access.requireRole(['teacher']), function(req, res, next) {
        var users = req.body.users || [];
        var groupIds = req.body.groups;
        Promise.fulfilled().then(function() {
            var arr =[Quest.findOne({
                _id: req.params.id
            }).exec()];
            if(groupIds) {
                arr.push(Group.find({_id:{$in:groupIds}}).exec());
            }
            return arr;
        }).spread(function(model, groups) {
            if (!model) return res.send(404, "Not Found");
            if (groups) {
                users = _.union(users,_.flatten(groups,'members'));
            }
            return Promise.map(users, function(userId) {
                return model.assignOrUpdate(userId);
            });
        }).then(function(uqs) {
            var usrs = User.find({
                _id: {
                    $in: users
                }
            }).exec();
            uqs = _.map(uqs,function (uq) {
                uq.id = uq._id;
                return uq;
            });
            return [uqs, usrs];
        }).spread(function(userquests, users) {
            res.json({
                userQuests: userquests,
                users:users
            });
        }).catch(next);
    });

    /**
     * unassign user from quest.
     *
     * @param range
     * @returns {status} 200
     */

    app.del('/api/quests/:id/unassign/:uid', access.requireRole(['teacher']), function(req, res, next) {
        Promise.fulfilled().then(function() {
            return UserQuest.findOne({
                quest: req.params.id,
                user: req.params.uid
            }).exec();
        }).then(function(userquest) {
            userquest.remove(function(err) {
                if (err) throw err;
                res.send(200);
            });
        }).catch(next);
    });

    /**
     * Delete quest.
     *
     * @param range
     * @returns {status} 200
     */

    app.del('/api/quests/:id', access.requireRole(['teacher']), function(req, res, next) {
        Quest.findById(req.params.id, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(404);
            model.remove(function(err, model) {
                if (err) return next(err);
                res.send(200);
            });
        });
    });

};
