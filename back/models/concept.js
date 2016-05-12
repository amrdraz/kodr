var mongoose = require('mongoose');
var Promise = require('bluebird');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
var relationship = require("mongoose-relationship");
var observer = require('../observer');


/*
	Concept Schema.

	This model represents a concept that would be held by any number of challenges for example :
		- print
		- conditions
		- loops

	@attribute max_exp           Number      Maximum exp that can be gained by a user in a concept.
*/
var ConceptSchema = new mongoose.Schema({
	author: {
		type: ObjectId,
		ref: 'User',
		unique: false
	},
	name: {
		type: String,
		unique: true
	},
	max_exp: {
		type: Number,
		default: 10
	},
	// Difficulty upgrade
	challenges: [{
		type: ObjectId,
		ref: 'Challenge'
	}],
	trials: [{
		type: ObjectId,
		ref: 'Trial'
	}]
});

ConceptSchema.plugin(require('../helpers/concept_helper'), 'Concept');

var Concept = module.exports = mongoose.model('Concept', ConceptSchema);
