var Promise = require('bluebird');
var mongoose = require('mongoose');
var _ = require('lodash');
var observer = require('../observer');

module.exports = exports = function lastModifiedPlugin(schema, options) {
	var Model = options.model || options;
	var Concept = mongoose.model('Concept');
	var Trial = mongoose.model('Trial');
	var Challenge = mongoose.model('Challenge');
	schema.plugin(require('./_common_helper'), options);

	schema.statics.findOrCreate = function(concept) {
		if (concept.name) {
			return Concept.getOneByQueryOrCreate({
				name: concept.name,
				max_exp: concept.max_exp
			}, concept);
		}
	}

	schema.statics.findTrialsWithConcept = function(concept, user, onlyOne) {
		/*
			Find Trials which have this concept.
			onlyOne -> Boolean attr -> if true then get trials with only this concept.
		*/
		var user_id = user.id || user;
		var concept_id = concept.id || concept;

        return Trial.find({
        	// Get all trials for this user
        	user: user_id,
        	_id: {$in: concept.trials}
        }).exec().then(function(trials) {
        	// Loop on trials
        	return _.map(trials, function(trial) {
        		// Check trial.concepts for this concept
        		if (trial.complete === false) {
        			if (onlyOne) {
		        		if ((concept_id in trial.concepts) && trial.concepts.length === 1) {
		        			return trial;
		        		}
		        	} else {
		        		if (concept_id in trial.concepts) {
		        			return trial;
		        		}
		        	}
        		}

        	});
        });

	}

	schema.methods.removeConcept = function() {
		var doc = this;
		doc.removeConceptFromChallenges();
		doc.removeConceptFromTrials();
	}

	schema.methods.removeConceptFromChallenges = function() {
		var doc = this;
		return Challenge.find({
			// Return all challenges that have this concept.
			_id: { $in: concept.challenges }
		}).exec().then(function(challenges) {
			_.map(challenges, function(challenge) {
				// Loop on each challenge
				_.remove(challenge.concepts, function(concept) {
					// Loop on its concepts to remove this one from the list
					return this.id === concept;
				});
			});
		});
	}

	schema.methods.removeConceptFromTrials = function() {
		var doc = this;
		return Trial.find({
			// Return all trials that have this concept.
			_id: { $in: concept.trials }
		}).exec().then(function(trials) {
			_.map(trials, function(trial) {
				// Loop on each trial
				_.remove(trial.concepts, function(concept) {
					// Loop on its concepts to remove this one from the list
					return this.id === concept;
				});
			});
		});
	}



}
