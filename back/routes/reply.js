var Promise = require('bluebird');
var Post = require('../models/post');
var Comment = require('../models/comment');
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

  });

  /**
   * Post a reply.
   *
   * @param   reply
   * @returns reply
   */

  app.post('/api/replies',access.requireRole() ,function(req, res, next) {
      console.log(req.body);
  });

}
