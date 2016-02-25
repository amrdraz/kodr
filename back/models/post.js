var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;


/**
 * Post Schema.
 *
 * @attribute title         String          post title
 * @attribute text          String          post markdown
 * @attribute author        [ObjectId]      Id of the User who created the post
 * @attribute votes         [ObjectId]      Id's of User's who voted the post
 * @attribute tags          [Tag]           lecture group used for segmentation (should probably abstract these data later)
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
  post_type: {
      type: Number
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

//PostSchema.plugin(require('../helpers/post'), 'Post');

var Post = module.exports = mongoose.model('Post', PostSchema);
