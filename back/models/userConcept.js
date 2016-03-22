var mongoose = require('mongoose');
var Promise = require('bluebird');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
var relationship = require("mongoose-relationship");
var observer = require('../observer');
var Concept = require("./concept");
var User = require('./user')


var UserConceptSchema = new mongoose.Schema({
	concept: {
		type: ObjectId,
		ref: 'Concept'
	},
	user: {
		type: ObjectId,
		ref: 'User'
	},
	exp: {
		type: Number,
		default: 0
	},
	max_exp: {
		type: Number,
		default: 10
	},
	last_practiced: {
		type: Date
	}
});


UserConceptSchema.plugin(require('../helpers/userConcept_helper'), 'UserConcept');

var UserConcept = module.exports = mongoose.model('UserConcept', UserConceptSchema);