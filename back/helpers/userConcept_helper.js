var Promise = require('bluebird');
var mongoose = require('mongoose');
var _ = require('lodash');
var observer = require('../observer');

module.exports = exports = function lastModifiedPlugin(schema, options) {
	var Model = options.model || options;
	var UserConcept = mongoose.model('UserConcept');
	var Concept = mongoose.model('Concept');
	schema.plugin(require('./_common_helper'), options);

	schema.pre('save', true, function(next, done){
		/* 
			Here we update:
				- last_practiced to the current Date.
				- we also update the exp.
		*/
		next(null, this);

		var userConcept = this;
		userConcept.last_practiced(Date.now());

		// if (userConcept.max_exp > (userConcept.exp + 1)) {
		// 	userConcept.exp ++;
		// }

		done(null, this);
	});

	schema.methods.IncExp = function() {
		/* Increment Exp if it is less than Max Exp */
		var doc = this;
		if (this.max_exp > this.exp) {
			return Promise.fulfilled().then(function() {
				var u_concept = UserConcept.update({
					_id: doc._id
				}, {
					$inc: { exp: 1 }
				}).exec();
				u_concept.save(); // To trigger the pre save
				return u_concept;
			});

			// return UserConcept.findOneByQueryOrCreateOrUpdate({
			// 	_id: doc._id
			// }, {
			// 	$inc: {exp: 1}
			// });

		}
	}


}