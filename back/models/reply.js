var mongoose = require('mongoose');
var observer = require('../observer');
var relationship = require("mongoose-relationship");
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;

/**
 * Reply Schema.
 *
 * @attribute text          String          reply markdown
 * @attribute comment       [ObjectId]      Id of the comment the reply belongs to
 * @attribute author        [ObjectId]      Id of the User who added the reply
 * @attribute votes         [ObjectId]      Id's of User's who voted the reply
 * @attribute created_at    [Date]          the time at which the reply was created
 * @attribute updated_at    [Date]          the last time at which the reply was updated
 *
 * @type {mongoose.Schema}
 */

var ReplySchema =  new mongoose.Schema({
  text: {
      type: String
  },
  comment: {
      type: ObjectId,
      ref: 'Comment',
      childPath:"replies"
  },
  author: {
      type: ObjectId,
      ref: 'User'
  },
  created_at: {
     type:Date
  },
  updated_at: {
     type:Date
  }
});

ReplySchema.plugin(relationship, { relationshipPathName:'comment' });
ReplySchema.plugin(require('../helpers/reply'), 'Reply');

var Reply = module.exports = mongoose.model('Reply', ReplySchema);
