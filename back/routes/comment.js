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
    Comment.findById(req.params.id, function(err, model) {
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
        comment.set(req.body.comment);
        if(!comment.isModified()){
            //Nothing is Modified
            return res.json({
              comment: comment
            });
        } else if(comment.isModified('votesUp')){
            comment.votesDown.remove(req.user.id);
        } else if(comment.isModified('votesDown')){
            comment.votesUp.remove(req.user.id);
        } else if(req.user._id.toString()===comment.author.toString()){
            //User is the owner of the comment, set updated_at
            comment.updated_at = new Date();
        } else {
            // Unauthorized
            return res.send(401, "Unauthorized");
        }
        comment.save(function(err,model) {
          if (err)
            next(err);
          res.json({
            comment: model
          });
        });
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
