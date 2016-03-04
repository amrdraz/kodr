var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
var relationship = require("mongoose-relationship");

var TagSchema = new mongoose.Schema({
   title: String,
   description: String
});

module.exports = mongoose.model('Tag', TagSchema);
