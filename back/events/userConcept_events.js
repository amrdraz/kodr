var observer = require('../observer');
var util = require('util');
var Activity = require('../models/activity');
var Challenge = require('../models/challenge');
var User = require('../models/user');
var mail = require('../config/mail');
var UserConcept = require('../models/userConcept');
var Suggestion = require('../models/suggestion');
var Trial = require('../models/trial');
var _ = require('lodash');

    
/**
 * Event listner for when a trial is complete
 * @param  {Trial} trial trial that was just complete for the first time
 * @return {[type]}       [description]
 */

 /* 
	In case of wrong answer
		- Get all concepts in the trial
		- Loop on each one and :
			- UserConcept.decreaseSlope
			- Suggestion.createOrIncrementSuggestion
	In case of right answer
		- Get all concepts
		- Loop on each one and :
			- if slope == 1 --> UserConcept.IncExp
			- else UserConcept.addSlopeToX
				- x == 1 ? --> UserConcept.resetX, Suggestion.resolve, UserConcept.IncExp
				- else END
*/

observer.on('trial.faliedOrPassed', function(trialId, uid, failed) {
	console.log("EVENT ****************************************************");
	
	Trial.findOne({
		_id: trialId
	}).then(function(trial) {
		var concepts = trial.concepts;
		_.map(concepts, function(cid) {
			
			UserConcept.findOne({
				user: uid,
				concept:cid
			}).then(function(userConcept) {
				if (failed) {
					/*
						createOrIncrement already calls userConcept.decreaseSlope()
						by calling the event suggestion.generateOrIncrement
					*/
					console.log("FAILED");
					Suggestion.createOrIncrementSuggestion(userConcept);
				} else {
					
					console.log("PASSED ****************************************************");
					/*
						addSlopeToX automatically detects the need to resetX, resolve a Suggestion
						or IncExp
					*/
					userConcept.addSlopeToX();
				}		
			});
		});
	});
});

// observer.on('trial.failed', function(trialId, uid) {
	
// 	Trial.findOne({
// 		_id: trialId
// 	}).then(function(trial) {
// 		var concepts = trial.concepts;
// 		_.map(concept, function(cid) {
// 			UserConcept.findOne({
// 				user: uid,
// 				concept:cid
// 			}).then(function(userConcept) {
// 				/*
// 					createOrIncrement already calls userConcept.decreaseSlope()
// 					by calling the event suggestion.generateOrIncrement
// 				*/
// 				Suggestion.createOrIncrementSuggestion(userConcept);
// 			});
// 		});
// 	});
// });

// observer.on('trial.passed', function(trialId, uid) {
	
// 	Trial.findOne({
// 		_id: trialId
// 	}).then(function(trial) {
// 		var concepts = trial.concepts;
// 		_.map(concept, function(cid) {
// 			UserConcept.findOne({
// 				user: uid,
// 				concept:cid
// 			}).then(function(userConcept) {
// 				/*
// 					addSlopeToX automatically detects the need to resetX, resolve a Suggestion
// 					or IncExp
// 				*/
// 				userConcept.addSlopeToX();
// 			});
// 		});
// 	});
// });

observer.on('userConcept.decreaseSlope', function(userConcept) {
	userConcept.decreaseSlope();
});

observer.on('suggestion.solved', function(userConcept) {
	// console.log(userConcept)
	userConcept.addSlopeToX();

});
