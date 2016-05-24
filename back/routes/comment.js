var Promise = require('bluebird');
var Post = require('../models/post');
var Question = require('../models/question');
var Comment = require('../models/comment');
var ExpiringToken = require('../models/expiringToken');
var access = require('./access');
var observer = require('../observer');
var Notification = require('../models/notification');

module.exports = function(app, passport) {

    /**
     * GET All comments of specific query
     *
     * @param   query {optional}
     * @returns comments
     */

    app.get('/api/comments', function(req, res, next) {
        if (req.query.post) {
            Comment.find({
                    post: req.query.post
                })
                .select('')
                .exec()
                .then(function(model) {
                    if (!model) return res.send(404, "Not Found");
                    res.json({
                        comments: model
                    });
                }, next);
        } else if (req.query.question) {
            Comment.find({
                    question: req.query.question
                })
                .select('')
                .exec()
                .then(function(model) {
                    if (!model) return res.send(404, "Not Found");
                    res.json({
                        comments: model
                    });
                }, next);
        } else {
            Comment
                .findById(req.params.id)
                .select('')
                .exec(function(err, model) {
                    if (err) return next(err);
                    if (!model) return res.send(404, "Not Found");
                    console.log(model);
                    res.json({
                        comment: model
                    });
                });
        }
    });

    /**
     * GET a comment.
     *
     * @param   comment id
     * @returns comment
     */

    app.get('/api/comments/:id', function(req, res, next) {
        Comment
            .findById(req.params.id)
            .select('')
            .exec(function(err, model) {
                if (err) return next(err);
                if (!model) return res.send(404, "Not Found");
                res.json({
                    comment: model
                });
            });
    });

    /**
     * Post a comment.
     *
     * @param   comment
     * @returns comment
     */

    app.post('/api/comments', access.requireRole(), function(req, res, next) {
        var comment = req.body.comment;
        comment.author = comment.user || req.user.id;
        comment.totalVotes = 0;
        comment = new Comment(comment);
        var container = comment.post ? Post : Question;
        var containerId = comment.post || comment.question;
        console.log(containerId);
        container.findById(containerId)
            .select('')
            .exec(function(err, container) {
                var notification = new Notification({
                    actor: comment.author,
                    subject: comment.question || comment.post,
                    reciever: container.author,
                    verb: "Comment"
                });
                console.log(notification);
                notification.save(function(err, notification) {
                    if (err)
                        next(err);
                    comment.save(function(err, model) {
                        if (err)
                            next(err);
                        res.json({
                            comment: model
                        });
                    });
                });
            });
    });

    app.get('/api/comments/:id/vote', access.requireRole(), function(req, res, next) {
        Comment.findById(req.params.id, function(err, comment) {
            if (err)
                next(err);
            else if (!comment)
                return next(new Error('Could find the Comment'));
            else {
                var vote = comment.votesUp.indexOf(req.user.id) != -1 ? 1 : comment.votesDown.indexOf(req.user.id) != -1 ? -1 : 0;
                res.json({
                    vote: vote
                });
            }
        });
    });

    /**
     * Vote up a Comment.
     *
     * @param
     * @returns {object} totalVotes
     */

    app.post('/api/comments/:id/voteUp', access.requireRole(), function(req, res, next) {
        Comment.findById(req.params.id, function(err, comment) {
            if (!comment)
                return next(new Error('Could find the Comment'));
            else {
                var len = comment.votesUp.length;
                comment.votesUp.remove(req.user.id);
                comment.votesDown.remove(req.user.id);
                if (len === comment.votesUp.length) {
                    comment.votesUp.push(req.user.id);
                }
                comment.totalVotes = comment.votesUp.length - comment.votesDown.length;
                comment.save(function(err, model) {
                    if (err)
                        next(err);
                    res.json({
                        model: model
                    });
                });
            }
        });
    });

    /**
     * Vote down a Comment.
     *
     * @param
     * @returns {object} totalVotes
     */

    app.post('/api/comments/:id/voteDown', access.requireRole(), function(req, res, next) {
        Comment.findById(req.params.id, function(err, comment) {
            if (!comment)
                return next(new Error('Could find the Comment'));
            else {
                var len = comment.votesDown.length;
                comment.votesUp.remove(req.user.id);
                comment.votesDown.remove(req.user.id);
                if (len === comment.votesDown.length) {
                    comment.votesDown.push(req.user.id);
                }
                comment.totalVotes = comment.votesUp.length - comment.votesDown.length;
                comment.save(function(err, model) {
                    if (err)
                        next(err);
                    res.json({
                        model: model
                    });
                });
            }
        });
    });

    /**
     * Edit a comment.
     *
     * @param   comment id
     * @returns
     */

    app.put('/api/comments/:id', access.requireRole(), function(req, res, next) {
        Comment.findById(req.params.id, function(err, comment) {
            if (!comment)
                return next(new Error('Could find the Comment'));
            else {
                // Set the comment without saving
                if (req.user._id.toString() === comment.author.toString()) {
                    //User is the owner of the comment, set updated_at
                    comment.set(req.body.comment);
                    comment.save(function(err, model) {
                        if (err)
                            next(err);
                        res.json({
                            comment: model
                        });
                    });
                } else {
                    // Unauthorized
                    return res.send(401, "Unauthorized");
                }
            }
        });
    });

    /**
     * Delete a comment.
     *
     * @param   comment id
     * @returns
     */

    app.delete('/api/comments/:id', access.requireRole(), function(req, res, next) {
        Comment.findById(req.params.id, function(err, comment) {
            if (!comment)
                return next(new Error('Could find the Comment'));
            else {
                if (req.user._id.toString() === comment.author.toString()) {
                    comment.remove(function(err) {
                        if (err)
                            return next(err);
                        res.send(204)
                    });
                } else {
                    return res.send(401, "Unauthorized");
                }
            }
        });
    });

}
