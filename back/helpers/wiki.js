var Promise = require('bluebird');
var mongoose = require('mongoose');
var _ = require('lodash');
var observer = require('../observer');

module.exports = exports = function (schema, options) {
    var Model = options.model || options;

    /**
     * Wiki Schema pre-save hooks.
     * on every save, add the date
     */
    schema.pre('save', true, function(next, done) {
        // get the current date
        var currentDate = new Date();

        // change the updated_at field to current date
        this.updated_at = currentDate;

        // if created_at doesn't exist, add to that field
        if (!this.created_at)
          this.created_at = currentDate;
        next();
        return done();
    });

};
