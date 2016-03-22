var Promise = require('bluebird');
var mongoose = require('mongoose');
var _ = require('lodash');
var observer = require('../observer');

module.exports = exports = function lastModifiedPlugin(schema, options) {
	var Model = options.model || options;
	var Suggestion = mongoose.model('Suggestion');
	var UserConcept = mongoose.model('UserConcept');
	var Concept = mongoose.model('Concept');
	var Trial = mongoose.model('Trial');
	schema.plugin(require('./_common_helper'), options);


	schema.pre('save', true, function(next, done){
		/* 
			Here we update:
				- suggestion's date to the current Date.
		*/
		next(null, this);
		this.date(Date.now());
		done(null, this);
	});

	schema.methods.markAsSolvedAndIncrementResolved = function() {
		/* Marks suggestion as solved and increments times_resolved */
		var doc = this;
		return Promise.fulfilled().then(function() {
			Suggestion.update({
				_id: doc._id
			}, {
				$inc: {times_resolved: 1},
				solved: true
			}).exec();
		});
	}

	schema.methods.incrementResolved = function() {
		/* Increments times_resolved for a suggestion */
		var doc = this;
		return Promise.fulfilled().then(function() {
			Suggestion.update({
				_id: doc._id
			}, {
				$inc: {times_resolved: 1}
			}).exec();
		});
	}

	schema.methods.resolve = function() {
		/* 
			Checks times_suggested against times_resolved in order
			to mark suggestion as solved if needed
		*/
		var doc = this;
		if (doc.times_suggested === doc.times_resolved + 1) {
			return doc.markAsSolvedAndIncrementResolved();
		} else {
			return doc.incrementResolved();
		}
	}

	schema.methods.getTrialsForSuggestion = function() {
		/* Gets incomplete trials for a concept in a suggestion */
		var doc = this;

		return UserConcept.getOneByQuery({
			_id: doc.user_concept
		}).then(function(userConcept) {
			return Concept.findTrialsWithConcept(userConcept.concept, userConcept.user, true);
		});
	}

	schema.statics.createOrIncrementSuggestion = function(suggestion) {
		// TODO: Check if 'Create if not found' is correct 
		return Suggestion.getByIdOr404(suggestion._id).then(function(err, sugg) {
			// Check if suggestion is already created for a certain concept
			if (err) {
				// If not found, create one
				return Promise.fulfilled().then(function() {
					Suggestion.create(suggestion);
				});
			} else {
				return Promise.fulfilled().then(function() {
					// If found, increment times and save to update Date
					Suggestion.update({
						_id: sugg._id
					}, {
						solved: false,
						$inc: {times_suggested: 1}
					}).exec().save();
				});	
			}
			
		});
	}

	schema.statics.getUnsolvedSuggestions = function(user) {
		var u_id = user || user.id;
		return Suggestion.getByQuery({
			user: u_id,
			solved: false
		});
	}



}