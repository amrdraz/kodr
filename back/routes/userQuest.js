var Promise = require('bluebird');
var _ = require('lodash');
var UserQuest = require('../models/userQuest');
var User = require('../models/user');
var access = require('./access');

module.exports = function(app, passport) {

    /**
     * Find UserQuest by id.
     *
     * @param {string} id
     * @returns {object} UserQuest
     */

    app.get('/api/userQuests/:id', access.requireRole(), function(req, res, next) {
        Promise.fulfilled().then(function() {
            return UserQuest.find({
                    userQuest: req.params.id
                }).populate('user userQuest').exec();
        }).then(function(q) {
            if (!q) return res.send(404, "Not Found");
            res.json({
                userQuests: q
            });
        }).catch(next);
    });


    /**
     * get all userQuests.
     *
     * @param range
     * @returns {object} userQuests
     */

    app.get('/api/userQuests', access.requireRole(['teacher']), function(req, res, next) {
        UserQuest.find(req.query).exec().then(function(model) {
            if (!model) return res.send(404, "Not Found");
            res.json({
                userQuest: model
            });
        }, next);
    });

    /**
     * Create new userQuests.
     *
     * @param range
     * @returns {object} userQuest
     */

    app.post('/api/userQuests', access.requireRole(['teacher']), function(req, res, next) {
        UserQuest.create(req.body.userQuest)
            .then(function(model) {
                res.json({
                    userQuest: model,
                });
            }, next);
    });


    /**
     * Update userQuests.
     *
     * @param range
     * @returns {object} userQuest
     */

    app.put('/api/userQuests/:id', access.requireRole(['teacher']), function(req, res, next) {
        var userQuest = req.body.userQuest;
        Promise.fulfilled().then(function() {
            return UserQuest.findOne({
                _id: req.params.id
            }).exec();
        }).then(function(model) {
            if (!model) return res.send(404, "Not Found");
            model.set(userQuest);
            model.save(function(err, model) {
                if (err) return next(err);
                res.json({
                    userQuest: model,
                });
            });
        }).catch(next);
    });

    /**
     * Delete userQuest.
     *
     * @param range
     * @returns {status} 200
     */

    app.del('/api/userQuests/:id', access.requireRole(['teacher']), function(req, res, next) {
        UserQuest.findById(req.params.id, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(404);
            model.remove(function(err, model) {
                if (err) return next(err);
                res.send(200);
            });
        });
    });

};
