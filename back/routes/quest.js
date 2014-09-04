var Promise = require('bluebird');
var _ = require('lodash');
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

    app.get('/api/quests/:id/studentsOptions', access.requireRole(['teacher']), function(req, res, next) {
        Promise.fulfilled().then(function() {
            return User.find({
                role: 'student',
                quests: {
                    $in: [req.params.id]
                }
            }, '_id username').exec();
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
                }).exec()
            ];
        }).spread(function(g, mbs) {
            if (!g) return res.send(404, "Not Found");
            res.json({
                quest: g,
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
        Quest.findOne({
            _id: req.params.id
        }).exec().then(function(model) {
            if (!model) return res.send(404, "Not Found");
            model.set(quest);
            model.save(function(err, model) {
                if (err) return next(err);
                res.json({
                    quest: model,
                });
            });
        }, next);
    });

    /**
     * unassign user from quest.
     *
     * @param range
     * @returns {status} 200
     */

    app.del('/api/quests/:id/users/:uid', access.requireRole(['teacher']), function(req, res, next) {
        Promise.fulfilled().then(function() {
            return UserQuest.findOne({
                quest: req.params.id,
                user: req.params.uid
            }).exec();
        }).spread(function(userquest) {
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
