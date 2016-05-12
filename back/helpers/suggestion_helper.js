var Promise = require('bluebird');
var mongoose = require('mongoose');
var observer = require('../observer');
var _ = require('lodash');
var Concept = require('../models/concept');
var Trial = require('../models/trial');
var UserConcept = require('../models/userConcept');
var User = require('../models/user');

module.exports = exports = function lastModifiedPlugin(schema, options) {
	var Model = options.model || options;
	schema.plugin(require('./_common_helper'), options);


	schema.pre('save', true, function(next, done){
		/* 
			Here we update:
				- suggestion's date to the current Date.
		*/
		var Suggestion = mongoose.model('Suggestion');
		next(null, this);
		
		var doc = this;
		Suggestion.update({
			_id: doc._id
		}, {
			date: Date.now()
		});
		done(null, this);
	});

	schema.methods.markAsSolvedAndIncrementResolved = function() {
		/* Marks suggestion as solved and increments times_resolved */
		var Suggestion = mongoose.model('Suggestion');
		var UserConcept = mongoose.model('UserConcept');
		var doc = this;
		return Promise.fulfilled().then(function() {
			doc.addResolvedDate();
			Suggestion.update({
				_id: doc._id
			}, {
				$inc: { times_resolved: 1 },
				solved: true
			}).exec().then(function() {
				UserConcept.findOne({
					_id: doc.user_concept
				}).exec();
			});
		});
	}

	schema.methods.incrementResolved = function() {
		/* Increments times_resolved for a suggestion */
		var Suggestion = mongoose.model('Suggestion');
		var doc = this;
		return Promise.fulfilled().then(function() {
			doc.addResolvedDate();			
			Suggestion.update({
				_id: doc._id
			}, {
				$inc: { times_resolved: 1 }
			}).exec();
		});
	}

	schema.methods.addResolvedDate = function() {
		var Suggestion = mongoose.model('Suggestion');
		var doc = this;
		var dates_resolved = doc.dates_resolved;
		dates_resolved.push(Date.now());
		Suggestion.update({
			_id: doc._id
		}, {
			dates_resolved: dates_resolved
		}).exec();
	}

	schema.methods.resolve = function() {
		/* 
			Checks times_suggested against times_resolved in order
			to mark suggestion as solved if needed
		*/
		var doc = this;
		var UserConcept = mongoose.model('UserConcept');
		UserConcept.findOne({
			_id: doc.user_concept
		}).exec().then(function(userConcept) {
			observer.emit('suggestion.solved', userConcept);
		});
		if (doc.times_suggested === doc.times_resolved + 1) {
			return doc.markAsSolvedAndIncrementResolved();
		} else {
			return doc.incrementResolved();
		}
	}

	schema.methods.getTrialsForSuggestion = function() {
		/* Gets incomplete trials for a concept in a suggestion */
		var doc = this;
		var UserConcept = mongoose.model('UserConcept');
		var User = mongoose.model('User');
		var Concept = mongoose.model('Concept'); 

		return UserConcept.findOne({
			_id: doc.user_concept
		}).exec().then(function(userConcept) {
			return Promise.fulfilled().then(function() {
				usr = User.findOne({
					_id: userConcept.user
				}).exec();
				con = Concept.findOne({
					_id: userConcept.concept
				}).exec();
				return [usr, con];
			}).spread(function(usr, con) {

				return Promise.fulfilled().then(function() {

					return Concept.findTrialsWithConcept(con, usr, true) 
				}).then(function(trials) {
					return trials
				});
			})
			
				
		});
	}

	schema.statics.createOrIncrementSuggestion = function(userConcept) {
		/* 
			Using a UserConcept, we get the suggestion related and increment
			the number of times it was suggested OR we create a suggestion
			for that UserConcept if none is found.
		*/
		var Suggestion = mongoose.model('Suggestion'); 
		return Suggestion.findOne({
			user_concept: userConcept._id
		}).then(function(suggestion) {
			observer.emit('userConcept.decreaseSlope', userConcept);
			if(suggestion) {
				return Promise.fulfilled().then(function() {
					var y = Suggestion.numberOfTimesToSuggest(userConcept, suggestion);
					var suggested_dates = suggestion.dates_suggested;
					suggested_dates.push(Date.now());
					Suggestion.update({
						_id: suggestion._id
					}, {
						// Reset solved to false in case it was already solved
						solved: false,
						$inc: { times_suggested: 1 },
						dates_suggested: suggested_dates
					}).then(function() {
						Suggestion.findOne({
		          _id: suggestion._id
		        });
					});
				});
			} else {
				var y = Suggestion.numberOfTimesToSuggest(userConcept, null);
				return Promise.fulfilled().then(function() {
					return Suggestion.create({
						user_concept: userConcept._id,
						user: userConcept.user,
						dates_suggested: [Date.now()]
					});
				});
			}
		});
	}

	schema.statics.numberOfTimesToSuggest = function(userConcept, suggestion) {
		/*
			Calculates the number of times a suggestion should be generated
			using the following function:

			number = ((1 - userConcept.x) / userConcept. slope) - (suggestion.times_generated - suggestion.times_resolved)
		*/
		var UserConcept = mongoose.model('UserConcept');
		return UserConcept.findOne({
			_id: userConcept._id
		}).exec().then(function(userConcept) {
			var y = (1 - userConcept.x) / userConcept.slope;
			if (suggestion)
				y = y - (suggestion.times_suggested - suggestion.times_resolved );
			return y;
		});
	}

	schema.statics.getUnsolvedSuggestions = function(user) {
		var Suggestion = mongoose.model('Suggestion');
		var u_id = user || user.id;
		return Suggestion.getByQuery({
			user: u_id,
			solved: false
		});
	}



}