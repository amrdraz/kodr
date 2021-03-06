var Promise = require('bluebird');
var Question = require('../models/question');
var ExpiringToken = require('../models/expiringToken');
var access = require('./access');
var observer = require('../observer');
var ObjectId = require('mongoose').Schema.Types.ObjectId;

module.exports = function(app, passport) {

    /**
     * Find Question by id.
     *
     * @param {string} id
     * @returns {object} Question
     */

    app.get('/api/questions/:id', function(req, res, next) {
        Question
            .findById(req.params.id)
            .select('')
            .exec(function(err, model) {
                if (err) return next(err);
                if (!model) return res.send(404, "Not Found");
                res.json({
                    question: model
                });
            });
    });

    /**
     * get all questions.
     *
     * @param
     * @returns {object} questions
     */

    app.get('/api/questions', function(req, res, next) {
        if (req.query.tag) {
            Question.find({
                'tags._id': req.query.tag
            }, function(err, model) {
                if (err)
                    return next(err);
                res.json({
                    questions: model
                });
            });
        } else if (req.query.author) {
            Question.find({
                'author': req.query.author
            }, function(err, model) {
                if (err)
                    return next(err);
                res.json({
                    questions: model
                });
            });
        } else {
            Question.find(req.query)
                .select('')
                .exec()
                .then(function(model) {
                    if (!model) return res.send(404, "Not Found");
                    res.json({
                        questions: model
                    });
                }, next);
        }
    });

    /**
     * Create new question.
     *
     * @param range
     * @returns {object} question
     */

    app.post('/api/questions', access.requireRole(), function(req, res, next) {
        var question = req.body.question;
        var tags = question.tags;
        delete question['tags'];
        question.author = question.user || req.user.id;
        question = new Question(question);
        question.findOrCreateTags(0, tags, question.tags, function(err, result) {
            if (err) {
                console.log(err);
                return next(err);
            }
            question.save(function(err, model) {
                if (err)
                    next(err);
                res.json({
                    question: model
                });
            });
        });

    });

    app.get('/api/questions/:id/vote', access.requireRole(), function(req, res, next) {
        Question.findById(req.params.id, function(err, question) {
            if (err)
                next(err);
            else if (!question)
                return next(new Error('Could find the Question'));
            else {
                var vote = question.votesUp.indexOf(req.user.id) != -1 ? 1 : question.votesDown.indexOf(req.user.id) != -1 ? -1 : 0;
                res.json({
                    vote: vote
                });
            }
        });
    });
    /**
     * Vote up a Question.
     *
     * @param
     * @returns {object} totalVotes
     */

    app.post('/api/questions/:id/voteUp', access.requireRole(), function(req, res, next) {
        Question.findById(req.params.id, function(err, question) {
            if (!question)
                return next(new Error('Could find the Question'));
            else {
                var len = question.votesUp.length;
                question.votesUp.remove(req.user.id);
                question.votesDown.remove(req.user.id);
                if (len === question.votesUp.length) {
                    question.votesUp.push(req.user.id);
                }
                question.totalVotes = question.votesUp.length - question.votesDown.length;
                question.save(function(err, model) {
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
     * Vote down a Question.
     *
     * @param
     * @returns {object} totalVotes
     */

    app.post('/api/questions/:id/voteDown', access.requireRole(), function(req, res, next) {
        Question.findById(req.params.id, function(err, question) {
            if (!question)
                return next(new Error('Could find the Question'));
            else {
                var len = question.votesDown.length;
                question.votesUp.remove(req.user.id);
                question.votesDown.remove(req.user.id);
                if (len === question.votesDown.length) {
                    question.votesDown.push(req.user.id);
                }
                question.totalVotes = question.votesUp.length - question.votesDown.length;
                question.save(function(err, model) {
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
     * Update an existing question.
     *
     * @param question id
     * @returns {object} question
     */

    app.put('/api/questions/:id', access.requireRole(), function(req, res, next) {
        Question.findById(req.params.id, function(err, question) {
            if (!question)
                return next(new Error('Could find the Question'));
            else {
                if (req.user._id.toString() === question.author.toString()) {
                    console.log(req.body.question);
                    var tags = req.body.question.tags;
                    delete req.body.question['tags'];
                    question.set(req.body.question);
                    while (question.tags.pop());
                    question.findOrCreateTags(0, tags, question.tags, function(err, result) {
                        if (err) {
                            console.log(err);
                            return next(err);
                        }
                        question.save(function(err, model) {
                            if (err)
                                next(err);
                            res.json({
                                question: model
                            });
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
     * Delete an existing question.
     *
     * @param   question id
     * @returns {object} question
     */

    app.delete('/api/questions/:id', access.requireRole(), function(req, res, next) {
        Question.findById(req.params.id, function(err, question) {
            if (!question)
                return next(new Error('Could find the Question'));
            else {
                if (req.user._id.toString() === question.author.toString()) {
                    question.remove(function(err) {
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
};
