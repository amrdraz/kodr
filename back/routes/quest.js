var Promise = require('bluebird');
var _ = require('lodash');
var observer = require('../observer');
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

    app.get('/api/quests/:id/unassignedUsersOptions', access.requireRole(['teacher','admin']), function(req, res, next) {
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
                }).populate('requirements').exec()
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

    app.get('/api/quests', access.requireRole(['teacher','admin']), function(req, res, next) {
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

    app.post('/api/quests', access.requireRole(['teacher','admin']), function(req, res, next) {
        req.body.quest.founder = req.user._id;
        Quest.create(req.body.quest)
            .then(function(model) {
                observer.emit('quest.create', req.user, model);
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

    app.put('/api/quests/:id', access.requireRole(['teacher','admin']), function(req, res, next) {
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
                observer.emit('quest.update', req.user, model);
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

    app.put('/api/quests/:id/assign', access.requireRole(['teacher','admin']), function(req, res, next) {
        var users = req.body.users || [];
        var groupIds = req.body.groups || [];
        var quest;
        Quest.getById_404(req.params.id).then(function(q) {
            quest = q;
            return [q,Group.getSubscribersFor(groupIds)];
        }).spread(function(model, subscribers) {
            if (subscribers.length>0) {
                users = _.union(users,_.flatten(subscribers,'user'));
            }
            return Promise.map(users, function(userId) {
                return model.assign(userId);
            });
        }).then(function(uqs) {
            observer.emit('user.assign', req.user, quest,req.body);
            observer.emit('mail.quest.assign', users);
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
            if(process.env.NODE_ENV==="test") {
                observer.once('test.mail.quest.assignment', function (infos) {
                    console.log(infos);
                    res.json({
                        infos: infos,
                        userQuests: userquests,
                        users:users
                    });
                });
            } else res.json({
                userQuests: userquests,
                users:users
            });
        }).catch(function(err) {
            console.log(err.stack);
            if (err.http_code) return res.send(err.http_code, err.message);
            next(err);
        });
    });

    /**
     * unassign user from quest.
     *
     * @param range
     * @returns {status} 200
     */

    app.del('/api/quests/:id/unassign/:uid', access.requireRole(['teacher','admin']), function(req, res, next) {
        Promise.fulfilled().then(function() {
            return UserQuest.findOne({
                quest: req.params.id,
                user: req.params.uid
            }).exec();
        }).then(function(userquest) {
            userquest.remove(function(err) {
                if (err) throw err;
                observer.emit('quest.unassign', req.user, userquest);
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

    app.del('/api/quests/:id', access.requireRole(['teacher','admin']), function(req, res, next) {
        Quest.findById(req.params.id, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(404);
            observer.emit('quest.delete', req.user, model);
            model.remove(function(err, model) {
                if (err) return next(err);
                res.send(200);
            });
        });
    });

};
