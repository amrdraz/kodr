var Promise = require('bluebird');
var _ = require('lodash');
var User = require('../models/user');
var access = require('./access');
var Challenge = require('../models/challenge');
var UserArena = require('../models/userArena');
var Arena = require('../models/arena');

module.exports = function(app, passport) {


    /**
     * Find userArena by id.
     *
     * @param {string} id
     * @returns {object} userArena
     */

    app.get('/api/userArenas/:id', access.requireRole(), function(req, res, next) {
        UserArena.findById(req.params.id, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(404, "Not Found");
            res.json({
                userArena: model
            });
        });
    });

    /**
     * get all userArenas.
     *
     * @param range
     * @returns {object} userArenas
     */

    app.get('/api/userArenas', access.requireRole(), function(req, res, next) {
        var arena = req.query.arena;
        if (arena) {
            UserArena.findOrCreateWithTrials({user:req.user.id,arena:arena})
                .spread(function(model, trials) {
                    res.json({
                        userArena: model,
                        trials: trials
                    });
                }).catch(next);
        } else if(req.query.ids) {
            req.query._id = {$in:req.query.ids};
            delete req.query.ids;
            UserArena.find(req.query, function(err, model) {
                if (err) return next(err);
                if (!model) return res.send(404, "Not Found");
                res.json({
                    userArena: model
                });
            });
        } else {
            Promise.fulfilled().then(function () {
                return Arena.find({}).exec();
            }).then(function (arenas) {
                return [
                    arenas,
                    Promise.map(arenas, function (arena) {
                        if(arena.isPublished) {
                            var obj = {arena:arena.id, user:req.user.id};
                            return UserArena.getOneByQueryOrCreate(obj, obj);
                        }
                    })
                ];
            }).spread(function (arenas, userArenas) {
                res.json({
                    userArena: _.filter(userArenas, null),
                    arena: arenas
                });
            }).catch(function (err) {
                console.log(err);
                next(err);
            });
        }
    });

    /**
     * Create new userArena.
     *
     * @param range
     * @returns {object} userArena
     */

    app.post('/api/userArenas', access.requireRole(), function(req, res, next) {
        req.body.userArena.user = req.user.id;
        UserArena.findOrCreateWithTrials(req.body.userArena)
            .spread(function(model, trials) {
                res.json({
                    userArena: model,
                    trials: trials
                });
            }).catch(next);
    });

    /**
     * Update new userArenas.
     *
     * @param range
     * @returns {object} userArena
     */

    app.put('/api/userArenas/:id',  access.requireRole({roles:[
        {role:'student', in:'userArenas'},
        {role:'teacher', all:true},
        {role:'admin', all:true},
    ]}), function(req, res, next) {
        var userArena = req.body.userArena;
        userArena.time = Date.now();
        userArena.times = (userArena.times || 0) + 1;
        UserArena.findById(req.params.id, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(404, "Not Found");
            model.set(userArena);
            model.save(function(err, model) {
                if (err) return next(err);
                res.json({
                    userArena: model
                });
            });
        });
    });

    /**
     * Delete userArena.
     *
     * @param range
     * @returns {status} 200
     */

    app.del('/api/userArenas/:id',  access.requireRole({roles:[
        {role:'student', in:'userArenas'},
        {role:'teacher', all:true},
        {role:'admin', all:true},
    ]}), function(req, res, next) {
        UserArena.findById(req.params.id, function(err, model) {
            if (err) return next(err);
            if(!model) return res.send(404);
            model.remove(function(err, model) {
                if (err) return next(err);
                res.send(200);
            });
        });
    });

};
