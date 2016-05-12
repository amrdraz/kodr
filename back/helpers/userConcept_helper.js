var Promise = require('bluebird');
var mongoose = require('mongoose');
var _ = require('lodash');
var observer = require('../observer');
var UserConcept = require('../models/userConcept');
var Concept = require('../models/concept');
var Suggestion = require('../models/suggestion');

module.exports = exports = function lastModifiedPlugin(schema, options) {
	var Model = options.model || options;
	schema.plugin(require('./_common_helper'), options);

	schema.pre('save', true, function(next, done){
		/*
			Here we update:
				- last_practiced to the current Date.
				- we also update the exp.
		*/
		next(null, this);

		var userConcept = this;
		

		done(null, this);
	});

	schema.methods.IncExp = function() {
		/* Increment Exp if it is less than Max Exp */
		var UserConcept = this.db.model('UserConcept');
		var doc = this;
		updateLastPracticed(doc);

		if (this.max_exp > this.exp) {

			return UserConcept.update({
				_id: doc._id
			}, {
				$inc: { exp: 1 }
			}).exec();

		} else {
			// Couldn't return anything empty, so I do a fake update.
			return UserConcept.update({
				_id: doc._id
			}, {}).exec();
		}
	}

	function updateLastPracticed(userConcept) {
		var UserConcept = mongoose.model('UserConcept');
		return UserConcept.update({
			_id: userConcept._id
		}, {
			last_practiced: Date.now()
		}).exec();
	}

	schema.methods.decreaseSlope = function() {
		var UserConcept = this.db.model('UserConcept');
		var doc = this;
		if (doc.slope > 0.125) {
			var new_slope = doc.slope / 2;
			return UserConcept.update({
				_id: doc._id
			}, {
				slope: new_slope
			}).exec();
		} else {
			return UserConcept.update({
				_id: doc._id
			}, {}).exec();
		}
	}

	schema.methods.resetSlope = function() {
		/*
			If x reached 1.0, then the user is back on track in this concept,
			now we will reset the slope to 1.0 and x back to 0.0
		*/
		var UserConcept = this.db.model('UserConcept');
		var doc = this;
		updateLastPracticed(doc);
		return UserConcept.update({
			_id: doc._id
		}, {
			x: 0.0,
			slope: 1.0,
			$inc: { exp: 1 }
		}).exec().then(function(h) {
			return Suggestion.findOne({
				user_concept: doc._id
			}).then(function(suggestion) {
				return suggestion.resolve();
			});
		});
		// TODO: resolve suggestion
		
	}

		schema.methods.resetSlopeAndIncExp = function() {
		/*
			If x reached 1.0, then the user is back on track in this concept,
			now we will reset the slope to 1.0 and x back to 0.0
		*/
		var UserConcept = this.db.model('UserConcept');
		var doc = this;
			return UserConcept.update({
				_id: doc._id
			}, {
				x: 0.0,
				slope: 1.0,
				$inc: { exp: 1 }
			}).exec().then(function(h) {
				return Suggestion.findOne({
					user_concept: doc._id
				}).then(function(suggestion) {
					return suggestion.resolve();
				})
			});
			// TODO: resolve suggestion
		
	}

	schema.methods.addSlopeToX = function() {
		/*
			Before the user's exp can be incremented, his slope should be 1.0 & x = 0.0.
			So the x is used to track if the user is still not doing well in this concept.
		*/
		var UserConcept = this.db.model('UserConcept');
		var doc = this;
		var new_x = doc.slope + doc.x;

		if (doc.slope < 1.0) {
			if (new_x < 1.0) {
				return UserConcept.update({
					_id: doc._id
				}, {
					x: new_x
				}).exec();
			} else {
				return doc.resetSlopeAndIncExp();
			}
		} else {
			return {}
		}
		
	}


}
