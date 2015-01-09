var Promise = require('bluebird');
var _ = require('lodash');
var Member = require('../models/member');
var User = require('../models/user');
var access = require('./access');

module.exports = function(app, passport) {
    
    /**
     * Find Member by id.
     *
     * @param {string} id
     * @returns {object} Member
     */

    app.get('/api/members/:id', access.requireRole(), function(req, res, next) {
        Member.getById_404(req.params.id).then(function (mb) {
            res.json({
                member: mb
            });
        }).catch(next);
    });


    /**
     * get all member.
     *
     * @param range
     * @returns {object} member
     */

    app.get('/api/members', access.requireRole(['student', 'teacher', 'admin']), function(req, res, next) {
        if(req.query.ids) {
            req.query._id = {$in:req.query.ids};
            delete req.query.ids;
        }
        Member.find(req.query).exec().then(function(model) {
            if (!model) return res.send(404, {
                message: "Not Found"
            });
            res.json({
                members: model
            });
        }, next);
    });

    /**
     * Create new member.
     *
     * @param range
     * @returns {object} member
     */

    app.post('/api/members', access.requireRole(['admin']), function(req, res, next) {
        if (req.body.member) {
            Member.create(req.body.member).then(function(model) {
                res.json({
                    member: model
                });
            });
        } else {
            res.send(304, "You sent nothing");
        }
    });
   
    /**
     * Update member.
     *
     * @param range
     * @returns {object} member
     */

    app.put('/api/members/:id', access.requireRole(['teacher', 'admin']), function(req, res, next) {
        var member = req.body.member;
        Member.getById_404(req.params.id).then(function(model) {
            model.set(member);
            model.save(function(err, model) {
                if (err) return next(err);
                res.json({
                    member: model
                });
            });
        }).catch(function(err) {
            if (err.http_code) return res.send(err.http_code, err.message);
            next(err);
        });
    });

    /**
     * Delete member.
     *
     * @param range
     * @returns {status} 204
     */

    app.del('/api/members/:id', access.requireRole(['admin']), function(req, res, next) {
        Member.getById_404(req.params.id).then(function(model) {
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
