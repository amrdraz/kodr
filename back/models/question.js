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
 * @attribute votesUp         [ObjectId]      Id's of User's who voted the question
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

var Question = module.exports = mongoose.model('Question', QuestionSchema);
