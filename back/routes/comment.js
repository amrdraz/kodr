var Promise = require('bluebird');
var Post = require('../models/post');
var Comment = require('../models/comment');
var ExpiringToken = require('../models/expiringToken');
var access = require('./access');
var observer = require('../observer');

module.exports = function(app, passport) {
  app.get('/api/comments/:id',function(req, res, next) {
    Comment.findById(req.params.id, function(err, model) {
        if (err) return next(err);
        if (!model) return res.send(404, "Not Found");
        res.json({
            comment: model
        });
    });
  });

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
