var mongoose = require('mongoose');
var observer = require('../observer');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;


/**
 * Question Schema.
 *
 * @attribute title         String          question title
 * @attribute text          String          question markdown
 * @attribute author        [ObjectId]      Id of the User who created the question
 * @attribute votesUp       [ObjectId]      Id's of User's who up voted the comment
 * @attribute votesDown     [ObjectId]      Id's of User's who down voted the comment
 * @attribute totalVotes    Number          All up votes minus all down votes
 * @attribute comments      [ObjectId]      Id's of Comment's on the question
 * @attribute tags          [Tag]           categories the question belongs to
 * @attribute created_at    [Date]          the time at which the question was created
 * @attribute updated_at    [Date]          the last time at which the question was updated
 *
 * @type {mongoose.Schema}
 */

var QuestionSchema =  new mongoose.Schema({
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
  totalVotes: [{
      type: Number,
      default: 0
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

QuestionSchema.plugin(require('../helpers/question'), 'Question');

var Question = module.exports = mongoose.model('Question', QuestionSchema);
