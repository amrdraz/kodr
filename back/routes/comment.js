var Promise = require('bluebird');
var Post = require('../models/post');
var Comment = require('../models/comment');
var ExpiringToken = require('../models/expiringToken');
var access = require('./access');
var observer = require('../observer');

module.exports = function(app, passport) {

  /**
   * GET a comment.
   *
   * @param   comment id
   * @returns comment
   */

  app.get('/api/comments/:id',function(req, res, next) {
    Comment
      .findOne(req.params.id)
      .select('')
      .exec(function (err, model) {
        if (err) return next(err);
        if(!model) return res.send(404,"Not Found");
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

  app.post('/api/comments',access.requireRole() ,function(req, res, next) {
    var comment = req.body.comment;
    comment.author = comment.user || req.user.id;
    comment.created_at = comment.updated_at = new Date();
    comment = new Comment(comment);
    comment.save(function(err,model) {
        if(err)
          next(err);
        res.json({
          comment: model
        });
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
        if(len === comment.votesUp.length){
            comment.votesUp.push(req.user.id);
        }
        comment.save(function(err,model) {
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
        if(len === comment.votesDown.length){
            comment.votesDown.push(req.user.id);
        }
        comment.save(function(err,model) {
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
        if(req.user._id.toString()===comment.author.toString()){
            //User is the owner of the comment, set updated_at
            comment.set(req.body.comment);
            comment.updated_at = new Date();
            comment.save(function(err,model) {
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
        if(req.user._id.toString()===comment.author.toString()){
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
