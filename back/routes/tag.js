var Promise = require('bluebird');
var Post = require('../models/post');
var Tag = require('../models/tag');
var ExpiringToken = require('../models/expiringToken');
var access = require('./access');
var observer = require('../observer');
var ObjectId = require('mongoose').Schema.Types.ObjectId;


module.exports = function(app, passport) {
  app.get('/api/tags', function(req, res, next) {
    Tag.find()
        .exec()
        .then(function(model) {
          if (!model) return res.send(404, "Not Found");
          res.json({
              tags: model
          });
    }, next);
  });

  /*
   *  findOrCreate
   *
   *
   *
   *
   *
   *
   */
  var findOrCreateTags = function(index,tags,result,res) {
      if(tags[index]){
          var title = tags[index].toLowerCase()
          Tag.findOne({title: title})
             .then(function(tag) {
                if(!tag){
                    //Not Found, Create new Tag
                    tag = new Tag({title:title});
                    tag.save(function (err,tag) {
                      if(err){
                        res.send()
                      }
                      result.push(tag);
                      findOrCreateTags(index+1,tags,result,res);
                    });
                    done.push(tag);
                }else{
                    //Repeated
                    if(result.indexOf(tag)==-1)
                        result.push(tag);
                    findOrCreateTags(index+1,tags,result,res);
                }
          });
      }else{
        res.json(result);
      }
  }
  app.get('/api/test',function(req, res, next) {
      var tags = ['Java','C++'];
      var done =[];
      findOrCreateTags(0,tags,done,res);
  });
}
