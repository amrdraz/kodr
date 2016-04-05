var Promise = require('bluebird');
var Post = require('../models/post');
var User = require('../models/user');
var ExpiringToken = require('../models/expiringToken');
var access = require('./access');
var observer = require('../observer');
var ObjectId = require('mongoose').Schema.Types.ObjectId;

module.exports = function(app, passport) {

    /**
     * Find Post by id.
     *
     * @param {string} id
     * @returns {object} Post
     */

    app.get('/api/posts/:id', function(req, res, next) {
        Post
            .findById(req.params.id)
            .select('')
            .exec(function(err, model) {
                if (err) return next(err);
                if (!model) return res.send(404, "Not Found");
                res.json({
                    post: model
                });
            });
    });

    /**
     * get all posts.
     *
     * @param
     * @returns {object} posts
     */

    app.get('/api/posts', function(req, res, next) {
        if (req.query.tag) {
            Post.find({
                'tags._id': req.query.tag
            }, function(err, model) {
                if (err)
                    return next(err);
                res.json({
                    posts: model
                });
            });
        } else {
            Post.find({
                    challenge: null
                })
                .select('')
                .exec()
                .then(function(model) {
                    if (!model) return res.send(404, "Not Found");
                    res.json({
                        posts: model
                    });
                }, next);
        }
    });

    /**
     * Create new post.
     *
     * @param range
     * @returns {object} post
     */

    app.post('/api/posts', access.requireRole(), function(req, res, next) {
        if (req.body.challenge) {
            var challenge = JSON.parse(req.body.challenge);
            var challenge_id = req.body.challenge_id;
            Post.findOne({
                'challenge': challenge_id
            }, function(err, post) {
                if (err)
                    return next(err);
                if (!post) {
                    var post = new Post();
                    post.challenge = challenge_id;
                    post.author = challenge.content.author;
                    var type = challenge.content.type;
                    post.totalVotes = 0;
                    post.title = challenge.content.name;
                    post.text = "**Author's Solution:** \n ~~~\n" +
                        challenge.content.blueprint.solution +
                        "\n~~~";
                    var tags = [];
                    tags.push(challenge.content.type);
                    post.findOrCreateTags(0, tags, post.tags, function(err, result) {
                        if (err) {
                            console.log(err);
                            return next(err);
                        }
                        post.save(function(err, model) {
                            if (err)
                                next(err);
                            res.json({
                                post: model
                            });
                        });
                    });
                } else {
                    console.log("hereeee");
                    res.json({
                        post: post
                    });
                }
            });
        } else {
            var post = req.body.post;
            var tags = post.tags;
            delete post['tags'];
            post.author = post.user || req.user.id;
            post = new Post(post);
            post.findOrCreateTags(0, tags, post.tags, function(err, result) {
                if (err) {
                    console.log(err);
                    return next(err);
                }
                post.save(function(err, model) {
                    if (err)
                        next(err);
                    res.json({
                        post: model
                    });
                });
            });
        }
    });

    app.get('/api/posts/:id/vote', access.requireRole(), function(req, res, next) {
        Post.findById(req.params.id, function(err, post) {
            if (err)
                next(err);
            else if (!post)
                return next(new Error('Could find the Post'));
            else {
                var vote = post.votesUp.indexOf(req.user.id) != -1 ? 1 : post.votesDown.indexOf(req.user.id) != -1 ? -1 : 0;
                res.json({
                    vote: vote
                });
            }
        });
    });

    /**
     * Vote up a Post.
     *
     * @param
     * @returns {object} totalVotes
     */

    app.post('/api/posts/:id/voteUp', access.requireRole(), function(req, res, next) {
        Post.findById(req.params.id, function(err, post) {
            if (!post)
                return next(new Error('Could find the Post'));
            else {
                var len = post.votesUp.length;
                var voteWeight = 10; //TODO change vote weight according to role
                post.votesUp.remove(req.user.id);
                post.votesDown.remove(req.user.id);
                //Increasing Post Author's reputation
                User.findById(post.author).exec(function(err, user) {
                    if (err) return next(err);
                    if (!user) return res.send(404, "Not Found");
                    if (len === post.votesUp.length) {
                        //Voting Up
                        post.votesUp.push(req.user.id);
                        user.rp = user.rp + voteWeight;
                    } else {
                        //Removing A Vote Up
                        user.rp = user.rp - voteWeight;
                    }
                    //Saving The User
                    user.save(function(err, u) {
                        if (err)
                            next(err);
                        console.log(u.rp);
                        //Saving The Post
                        post.totalVotes = post.votesUp.length - post.votesDown.length;
                        post.save(function(err, model) {
                            if (err)
                                next(err);
                            res.json({
                                model: model
                            });
                        });
                    });
                });

            }
        });
    });

    /**
     * Vote down a Post.
     *
     * @param
     * @returns {object} totalVotes
     */

    app.post('/api/posts/:id/voteDown', access.requireRole(), function(req, res, next) {
        Post.findById(req.params.id, function(err, post) {
            if (!post)
                return next(new Error('Could find the Post'));
            else {
                var len = post.votesDown.length;
                var voteWeight = 10; //TODO change vote weight according to role
                post.votesUp.remove(req.user.id);
                post.votesDown.remove(req.user.id);
                //Decreasing Post Author's reputation
                User.findById(post.author).exec(function(err, user) {
                    if (err) return next(err);
                    if (!user) return res.send(404, "Not Found");
                    if (len === post.votesDown.length) {
                        //Voting Down
                        post.votesDown.push(req.user.id);
                        user.rp = user.rp - voteWeight;
                    } else {
                        //Removing a vote Down
                        user.rp = user.rp + voteWeight;
                    }
                    //Saving The User
                    user.save(function(err, u) {
                        if (err)
                            next(err);
                        console.log(u.rp);
                        //Saving The Post
                        post.totalVotes = post.votesUp.length - post.votesDown.length;
                        post.save(function(err, model) {
                            if (err)
                                next(err);
                            res.json({
                                model: model
                            });
                        });
                    });
                });
            }
        });
    });

    /**
     * Update an existing post.
     *
     * @param post id
     * @returns {object} post
     */

    app.put('/api/posts/:id', access.requireRole(), function(req, res, next) {
        Post.findById(req.params.id, function(err, post) {
            if (!post)
                return next(new Error('Could find the Post'));
            else {
                if (req.user._id.toString() === post.author.toString()) {
                    var tags = req.body.post.tags;
                    delete req.body.post['tags'];
                    post.set(req.body.post);
                    while (post.tags.pop());
                    post.findOrCreateTags(0, tags, post.tags, function(err, result) {
                        if (err) {
                            console.log(err);
                            return next(err);
                        }
                        post.save(function(err, model) {
                            if (err)
                                next(err);
                            res.json({
                                post: model
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
     * Delete an existing post.
     *
     * @param   post id
     * @returns {object} post
     */

    app.delete('/api/posts/:id', access.requireRole(), function(req, res, next) {
        Post.findById(req.params.id, function(err, post) {
            if (!post)
                return next(new Error('Could find the Post'));
            else {
                if (req.user._id.toString() === post.author.toString()) {
                    post.remove(function(err) {
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
