var mongoose = require('mongoose');

/**
 * Person Schema.
 *
 * @type {mongoose.Schema}
 */

var personSchema = new mongoose.Schema({
    name: String,
    age: Number
});

module.exports = mongoose.model('Person', personSchema);
