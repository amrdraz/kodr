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
	},
	slope: {
		type: Number,
		default: 1.0,
		min: 0.125
	},
	x: {
		/*
			Used in accordance with the slope.
			Accumlates slope value if slope is less then 1.
			When it reaches 1.0, it means that a suggestion is solved
			and it is reset to 0.
		*/
		type: Number,
		default: 0.0
	}
});


UserConceptSchema.plugin(require('../helpers/userConcept_helper'), 'UserConcept');

var UserConcept = module.exports = mongoose.model('UserConcept', UserConceptSchema);