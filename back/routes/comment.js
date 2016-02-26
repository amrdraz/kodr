var Promise = require('bluebird');
var Post = require('../models/post');
var ExpiringToken = require('../models/expiringToken');
var access = require('./access');
var observer = require('../observer');

module.exports = function(app, passport) {

  app.post('/api/comments',access.requireRole() ,function(req, res, next) {
      var comment = req.body.comment;
  });

}
