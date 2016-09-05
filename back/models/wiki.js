var mongoose = require('mongoose');
var observer = require('../observer');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;

/**
 * Wiki Schema.
 *
 * @attribute title         String          wiki title
 * @attribute text          String          wiki markdown
 * @attribute author        [ObjectId]      Id of the User who created the wiki
 * @attribute created_at    [Date]          the time at which the wiki was created
 * @attribute updated_at    [Date]          the last time at which the wiki was updated
 *
 * @type {mongoose.Schema}
 */

var WikiSchema =  new mongoose.Schema({
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
  created_at: {
     type:Date
  },
  updated_at: {
     type:Date
  }
});

WikiSchema.plugin(require('../helpers/wiki'), 'Wiki');

var Wiki = module.exports = mongoose.model('Wiki', WikiSchema);
