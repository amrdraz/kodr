var mongoose = require('mongoose');
var observer = require('../observer');
var relationship = require("mongoose-relationship");
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;

/**
 * Comment Schema.
 *
 * @attribute text          String          comment markdown
 * @attribute post          [ObjectId]      Id of the Post the comment belongs to
 * @attribute author        [ObjectId]      Id of the User who added the comment
 * @attribute votes         [ObjectId]      Id's of User's who voted the comment
 * @attribute created_at    [Date]          the time at which the post was created
 * @attribute updated_at    [Date]          the last time at which the post was updated
 *
 * @type {mongoose.Schema}
 */

var CommentSchema =  new mongoose.Schema({
  text: {
      type: String
  },
  post: {
      type: ObjectId,
      ref: 'Post',
      childPath:"comment"
  },
  author: {
      type: ObjectId,
      ref: 'User'
  },
  votes: [{
      type: ObjectId,
      ref: 'User'
  }],
  created_at: {
     type:Date
  },
  updated_at: {
     type:Date
  }
});

CommentSchema.plugin(relationship, { relationshipPathName:'post' });

var Comment = module.exports = mongoose.model('Comment', CommentSchema);
