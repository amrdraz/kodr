var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;

/**
 * Achievement Schema.
 * An achievement is a means of indicating progress
 * It reuires a certain expreiance level to be achieved one or several arenas
 * 
 * @type {mongoose.Schema}
 */

var Achievement = new mongoose.Schema({
    name: {
        type: String,
    },
    description:  {
        type: String,
    },
    requirements: {
        type: [Mixed],
    },
    author: {
        type: ObjectId, ref: 'User'
    },
    
});

module.exports = mongoose.model('Achievement', Achievement);
