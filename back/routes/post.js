var Promise = require('bluebird');
var Post = require('../models/post');
var ExpiringToken = require('../models/expiringToken');
var access = require('./access');
var observer = require('../observer');

module.exports = function(app, passport) {

  /**
   * Find Post by id.
   *
   * @param {string} id
   * @returns {object} Post
   */

  app.get('/api/posts/:id', function(req, res, next) {
      Post.findById(req.params.id, function(err, model) {
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
      Post.find(req.query).exec().then(function(model) {
          if (!model) return res.send(404, "Not Found");
          res.json({
              post: model
          });
      }, next);
  });

  /**
   * Create new post.
   *
   * @param range
   * @returns {object} post
   */

  app.post('/api/posts', access.requireRole(), function(req, res, next) {
      var post = req.body.post;
      post.author = post.user || req.user.id;
      post.created_at = post.updated_at = new Date();
      post = new Post(post);
      post.save(function(err,model) {
          if(err)
            next(err);
          res.json({
            post: model
          });
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
        // Set the post without saving
        post.set(req.body.post);
        if(!post.isModified()){
            //Nothing is Modified
            return res.json({
              post: post
            });
        } else if(post.isModified('votesUp')){
            post.votesDown.remove(req.user.id);
        } else if(post.isModified('votesDown')){
            post.votesUp.remove(req.user.id);
        } else if(req.user._id.toString()===post.author.toString()){
            //User is the owner of the post, set updated_at
            post.updated_at = new Date();
        } else {
            // Unauthorized
            return res.send(401, "Unauthorized");
        }
        post.save(function(err,model) {
          if (err)
            next(err);
          res.json({
            post: model
          });
        });
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
        if(req.user._id.toString()===post.author.toString()){
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
