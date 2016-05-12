var mongoose = require('mongoose');
var Promise = require('bluebird');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
var relationship = require("mongoose-relationship");
var observer = require('../observer');
var UserConcept = require("./userConcept");
var User = require('./user')

var SuggestionSchema = new mongoose.Schema({
	user_concept: {
		type: ObjectId,
		ref: 'UserConcept'
	},
	user: {
		type: ObjectId,
		ref: 'User'
	},
	dates_suggested: [{
		type: Date
	}],
	dates_resolved: [{
		type: Date
	}],
	date: {
		// Last time it was suggested, might be redundant
		type: Date,
		default: Date.now()
	},
	solved: {
		type: Boolean,
		default: false
	},
	times_suggested: {
		// Number of times a concept was suggested
		type: Number,
		default: 2
	},
	times_resolved: {
		// Number of times a suggestion was resovled
		type: Number,
		default: 0
	}
});

SuggestionSchema.plugin(require('../helpers/suggestion_helper'), 'Suggestion');

var Suggestion = module.exports = mongoose.model('Suggestion', SuggestionSchema);
