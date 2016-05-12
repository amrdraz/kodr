var Promise = require('bluebird');
var mongoose = require('mongoose');
var _ = require('lodash');
var observer = require('../observer');
var Concept = require('../models/concept');
var Trial = require('../models/trial');
var Challenge = require('../models/challenge');
var ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = exports = function lastModifiedPlugin(schema, options) {
	var Model = options.model || options;
	schema.plugin(require('./_common_helper'), options);

	schema.statics.findOrCreate = function(concept) {
		var Concept = mongoose.model('Concept');
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
			onlyOne -> Boolean attr -> if true then get trials with only this one concept.
		*/
		var user_id = user._id || user;
		var concept_id = concept._id || concept;

        return Trial.find({
        	// Get all trials for this user
        	user: user_id,
        	_id: { $in: concept.trials }
        }).exec().then(function(trials) {

        	// Loop on trials
        	var result = map(trials, onlyOne, concept_id);
        	// remove undefined
        	return _.remove(result, undefined);
        });

	}

	function map(trials, onlyOne, concept_id) {
		return _.map(trials, function(trial) {
    		// Check trial.concepts for this concept
    		if (trial.complete === false) {
    			if (onlyOne) {
	        		if (isInArray(concept_id, trial.concepts) && trial.concepts.length === 1) {

	        			return trial;
	        		}
	        	} else {
	        		if (isInArray(concept_id, trial.concepts)) {
	        			return trial;
	        		}
	        	}
    		}

    	});
	}

	function isInArray(obj, array) {
		return array.some(function(a) {
			return a.equals(obj);
		});
	};

	schema.methods.removeConcept = function() {
		var doc = this;
		doc.removeConceptFromChallenges();
		doc.removeConceptFromTrials();
	}

	schema.methods.removeConceptFromChallenges = function() {
		var doc = this;
		return Challenge.find({
			// Return all challenges that have this concept.
			_id: { $in: doc.challenges }
		}).exec().then(function(challenges) {
			_.map(challenges, function(challenge) {
				// Loop on each challenge
				_.remove(challenge.concepts, function(concept) {
					// Loop on its concepts to remove this one from the list
					return concept.equals(doc.id);
				});

				Challenge.update({
					_id: challenge.id
				},{
					concepts: challenge.concepts
				}).exec();
				
				return challenge;
			});
		});
	}
// TODO: remove user concept
	schema.methods.removeConceptFromTrials = function() {
		var doc = this;
		return Trial.find({
			// Return all trials that have this concept.
			_id: { $in: doc.trials }
		}).exec().then(function(trials) {
			// console.log(trials)
			return _.map(trials, function(trial) {
				// Loop on each trial
				_.remove(trial.concepts, function(concept) {
					// Loop on its concepts to remove this one from the list
					return concept.equals(doc.id);
				});

				Trial.update({
					_id: trial.id
				},{
					concepts: trial.concepts
				}).exec();
				
				return trial;
			});
		});
	}



}
