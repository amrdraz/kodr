var Promise = require('bluebird');
var Post = require('../models/post');
var Tag = require('../models/tag');
var ExpiringToken = require('../models/expiringToken');
var access = require('./access');
var observer = require('../observer');
var ObjectId = require('mongoose').Schema.Types.ObjectId;


module.exports = function(app, passport) {
  app.get('/api/tags', function(req, res, next) {
      var tag = new Tag({
          title: "java",description: "programming language"
      });
      var tag2 = new Tag({
          title: "c++",description: "strong programming language"
      });
      post = new Post({title: 'Hello',text: 'World'});
      post.tags.push(tag);
      post.tags.push(tag2);
      post.save(function (err,post) {
          res.json({
            post: post
          })
      });
  });

}
