var mongoose = require('mongoose');
var observer = require('../observer');
var relationship = require("mongoose-relationship");
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;

/**
 * Comment Schema.
 *
 * @attribute text          String          comment markdown
 * @attribute post          ObjectId        Id of the Post the comment belongs to
 * @attribute author        ObjectId        Id of the User who added the comment
 * @attribute votesUp       [ObjectId]      Id's of User's who up voted the comment
 * @attribute votesDown     [ObjectId]      Id's of User's who down voted the comment
 * @attribute totalVotes    Number          All up votes minus all down votes
 * @attribute created_at    Date            the time at which the comment was created
 * @attribute updated_at    Date            the last time at which the comment was updated
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
      childPath:"comments"
  },
  question: {
      type: ObjectId,
      ref: 'Question',
      childPath:"comments"
  },
  author: {
      type: ObjectId,
      ref: 'User'
  },
  replies: [{
      type: ObjectId,
      ref: 'Reply'
  }],
  votesUp: [{
      type: ObjectId,
      ref: 'User'
  }],
  votesDown: [{
      type: ObjectId,
      ref: 'User'
  }],
  totalVotes: [{
      type: Number,
      default: 0
  }],
  created_at: {
     type:Date
  },
  updated_at: {
     type:Date
  }
});

CommentSchema.plugin(relationship, { relationshipPathName:['post','question'] });
CommentSchema.plugin(require('../helpers/comment'), 'Comment');

var Comment = module.exports = mongoose.model('Comment', CommentSchema);
