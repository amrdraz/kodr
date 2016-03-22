var Promise = require('bluebird');
var _ = require('lodash');
var User = require('../models/user');
var access = require('./access');
var Challenge = require('../models/challenge');
var Arena = require('../models/arena');
var Trial = require('../models/trial');
var UserArena = require('../models/userArena');

module.exports = function(app, passport) {


    /**
     * Find trial by id.
     *
     * @param {string} id
     * @returns {object} trial
     */

    app.get('/api/trials/:id', access.requireRole(), function(req, res, next) {
        Trial.getById(req.params.id).then(function(model) {
            res.json({
                trial: model
            });
        }).catch(next);
    });

    /**
     * get all trials.
     *
     * @param range
     * @returns {object} trials
     */

    app.get('/api/trials', access.requireRole(), function(req, res, next) {
        var promise;
        // UserArena.findOrCreateWithTrials({user:req.query.user,arena:req.query.arena});
        if(req.query.ids) {
            req.query._id = {$in:req.query.ids};
            delete req.query.ids;
            promise = Trial.getByQuery(req.query).then(function(model) {
                res.json({
                    trial: model
                });
            });
        } else if(req.query.arena || req.query.userArena) {
            var userId;
            if(req.user.isStudent) {
                userId = req.user.id;
            } else {
                userId = req.query.user || req.user.id;
            }
            promise = Promise.fulfilled().then(function () {
                if(!req.query.arena) {
                    return Arena.getByQuery({users: {$in:[req.query.userArena]}});
                } else {
                    return {id:req.query.arena};
                }            
            }).then(function (arena) {
                var userarena = {};
                if(req.query.userArena) {
                    userarena.id = req.query.userArena;
                } else {
                    var obj = {arena:arena.id, user:userId};
                    userarena = UserArena.getOneByQueryOrCreate(obj, obj);
                }
                return [Challenge.getByQuery({arena:arena.id}), userarena, arena];
            }).spread(function (challenges, ua, arena) {
                challenges = _.filter(challenges, 'isPublished');
                return [
                    challenges,
                    Promise.map(challenges, function (ch) {
                        var obj = {arena:arena.id, userArena:ua.id, challenge:ch.id, user:userId};
                        var update = _.clone(obj);
                        update.order = ch.order;
                        update.group = ch.group;
                        return Trial.getOneByQueryOrCreateOrUpdate(obj, update);
                    })
                ];
            }).spread(function (challenges, trials) {
                res.json({
                    challenge:challenges,
                    trial: _.filter(trials, null)
                });
            });
        } else {
            promise = Trial.getByQuery(req.query).then(function(model) {
                res.json({
                    trial: model
                });
            });
        }
        promise.catch(next);
    });

    /**
     * Create new trials.
     *
     * @param range
     * @returns {object} trial
     */

    app.post('/api/trials', access.requireRole(), function(req, res, next) {
        var trial = req.body.trial;
        if (!trial.challenge) return res.send(400, 'you must include a challenge id in your data');
        trial.user = trial.user || req.user.id;
        Trial.findOrCreate(trial).then(function(trial) {
            res.json({
                trial: trial
            });
        }).catch(next);
    });

    /**
     * Update new trials.
     *
     * @param range
     * @returns {object} trial
     */

    app.put('/api/trials/:id', access.requireRole({
        roles: [{
            role: 'student',
            // in : 'trials',
            all:true
        }, {
            role: 'teacher',
            all: true
        }, {
            role: 'admin',
            all: true
        }, ]
    }), function(req, res, next) {
        var trial = req.body.trial;
        trial.time = Date.now();
        Trial.findOne({
            _id: req.params.id
        }).exec().then(function(model) {
            if (!model) return res.send(404, "Not Found");
            model.set(trial);
            model.save(function(err, model) {
                if (err) return next(err);
                res.json({
                    trial: model
                });
            });
        }, next);
    });

    /**
     * Delete trial.
     *
     * @param range
     * @returns {status} 200
     */

    app.del('/api/trials/:id', access.requireRole({
        roles: [{
            role: 'student',
            in : 'trials'
        }, {
            role: 'teacher',
            all: true
        }, {
            role: 'admin',
            all: true
        }, ]
    }), function(req, res, next) {
        Trial.findById(req.params.id, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(404);
            model.remove(function(err, model) {
                if (err) return next(err);
                res.send(200);
            });
        });
    });

};
