var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

/**
 * Challenge Schema.
 *
 * @type {mongoose.Schema}
 */

var challengeSchema = new mongoose.Schema({
    name: {
        type: String,
        'default': 'New Challenge'
    },
    setup: {
        type: String,
        'default': '// Starting Code leave blank if you want Student to start from scrach\n'
    },
    solution:  {
        type: String,
        'default': '// Challenge Solution goes here\n'
    },
    tests:  {
        type: String,
        'default': '// Challenge Tests go here\n'
    },
    structure:  {
        type: String,
        'default': '// Challenge Code Structure\n'
    },
    callbacks:  {
        type: String,
        'default': '// callbacks for structure variables if any\n{}'
    },
    description:  {
        type: String,
        'default': 'A new Challenge'
    },
    // the current state of a cahllenge
    status:  {
        type: String,
        'default': 'unPublished',        
        'enum': ['unPublished','Beta', 'Published']
    },
    isPublished:  {
        type: Boolean,
        'default': false
    },
    exp: {
        type: Number,
        'default':1,
        min:1
    },
    author: {
        type: ObjectId, ref: 'User'
    },
    
});

module.exports = mongoose.model('Challenge', challengeSchema);
