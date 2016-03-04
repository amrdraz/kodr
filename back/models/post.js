var mongoose = require('mongoose');
var observer = require('../observer');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;


/**
 * Post Schema.
 *
 * @attribute title         String          post title
 * @attribute text          String          post markdown
 * @attribute author        [ObjectId]      Id of the User who created the post
 * @attribute votesUp         [ObjectId]      Id's of User's who voted the post
 * @attribute comments      [ObjectId]      Id's of Comment's on the post
 * @attribute tags          [Tag]           categories the post belongs to
 * @attribute created_at    [Date]          the time at which the post was created
 * @attribute updated_at    [Date]          the last time at which the post was updated
 *
 * @type {mongoose.Schema}
 */

var PostSchema =  new mongoose.Schema({
  title: {
      type: String
  },
  text: {
      type: String
  },
  author: {
      type: ObjectId,
      ref: 'User'
  },
  votesUp: [{
      type: ObjectId,
      ref: 'User'
  }],
  votesDown: [{
      type: ObjectId,
      ref: 'User'
  }],
  comments: [{
      type: ObjectId,
      ref: 'Comment'
  }],
  created_at: {
     type:Date
  },
  updated_at: {
     type:Date
  }
});

//PostSchema.plugin(require('../helpers/post'), 'Post');

var Post = module.exports = mongoose.model('Post', PostSchema);
