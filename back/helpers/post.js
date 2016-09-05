var Promise = require('bluebird');
var mongoose = require('mongoose');
var Tag = require('../models/tag');
var _ = require('lodash');
var observer = require('../observer');

module.exports = exports = function (schema, options) {
    var Model = options.model || options;

    var findOrCreateTags = schema.methods.findOrCreateTags = function(index, tags, result, cb) {
        if(tags[index]){
            var title = tags[index].toLowerCase();
            Tag.findOne({title: title})
               .then(function(tag) {
                  if(!tag){
                      //Not Found, Create new Tag
                      tag = new Tag({title:title});
                      tag.save(function (err,tag) {
                        if(err){
                          return cb(err,null);
                        }
                        result.push(tag);
                        findOrCreateTags(index+1,tags,result,cb);
                      });
                  }else{
                      //Repeated
                      if(!result.id(tag))
                          result.push(tag);
                      findOrCreateTags(index+1,tags,result,cb);
                  }
            });
        }else{
          cb(null,result);
        }
    };

    /**
     * Post Schema pre-save hooks.
     * on every save, add the date
     */
    schema.pre('save', true, function(next, done) {
        // get the current date
        var currentDate = new Date();

        // change the updated_at field to current date
        this.updated_at = currentDate;

        // if created_at doesn't exist, add to that field
        if (!this.created_at)
          this.created_at = currentDate;
        next();
        return done();
    });

};
