var Promise = require('bluebird');
var Post = require('../models/post');
var Comment = require('../models/comment');
var Reply = require('../models/reply');
var ExpiringToken = require('../models/expiringToken');
var access = require('./access');
var observer = require('../observer');

module.exports = function(app, passport) {

  /**
   * GET a reply.
   *
   * @param   reply id
   * @returns reply
   */

  app.get('/api/replies/:id',function(req, res, next) {
    Reply.findById(req.params.id, function(err, model) {
        if (err) return next(err);
        if (!model) return res.send(404, "Not Found");
        res.json({
            reply: model
        });
    });
  });

  /**
   * Post a reply.
   *
   * @param   reply
   * @returns reply
   */

  app.post('/api/replies',access.requireRole() ,function(req, res, next) {
    var reply = req.body.reply;
    reply.author = reply.user || req.user.id;
    reply = new Reply(reply);
    reply.save(function(err,model) {
        if(err)
          next(err);
        res.json({
          reply: model
        });
    });
  });

  /**
   * Edit a reply.
   *
   * @param   reply id
   * @returns
   */

  app.put('/api/replies/:id', access.requireRole(), function(req, res, next) {
    Reply.findById(req.params.id, function(err, reply) {
      if (!reply)
        return next(new Error('Could find the Reply'));
      else {
        if(req.user._id.toString()===reply.author.toString()){
          reply.set(req.body.reply);
          reply.save(function(err,model) {
            if (err)
              next(err);
            res.json({
              reply: model
            });
          });
        } else {
            return res.send(401, "Unauthorized");
        }
      }
    });
  });

  /**
   * Delete a reply.
   *
   * @param   reply id
   * @returns
   */

  app.delete('/api/replies/:id', access.requireRole(), function(req, res, next) {
    Reply.findById(req.params.id, function(err, reply) {
      if (!reply)
        return next(new Error('Could find the Reply'));
      else {
        if(req.user._id.toString()===reply.author.toString()){
            reply.remove(function(err) {
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
