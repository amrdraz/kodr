var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('lodash');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
var relationship = require("mongoose-relationship");
var ArenaTrial = require('./arenaTrial');
var Trial = require('./trial');
var observer = require('../observer');

/**
 * Requirement Schema.
 * A condition that triggers the completion of an Achievement or a Quest, is a means of indicating progress
 * requirments are checked for a user using the isActive function
 *
 * @property {Mixed}    property        The property that has a requirement set on it
 *
 * @property {Mixed}    condition       The condition that triggers the activation
 *                                      Can be of type '<=', '>=', '=' for properties of type number type
 *
 * @property {Mixed}    activation      The activation value for the condition
 *
 * @type {mongoose.Schema}
 */

var RequirementSchema = new mongoose.Schema({
    model1: {
        type: String,
        default: 'Challenge'
    },
    id1: String,
    model2: {
        type: String,
        default: 'Arena'
    },
    id2: String,
    action: {
        type: String,
        default: 'complete',
        enum: ['complete', 'get']
    },
    times: {
        type: Number,
        default: 1,
        min: 1
    },
    completed: {
        type: Number,
        default: 0
    },
    complete: {
        type: Boolean,
        default: false
    },
    property: {
        type: Mixed,
    },
    condition: {
        type: Mixed,
    },
    activation: {
        type: Mixed,
    },
    user: {
        type: ObjectId,
        ref: 'User'
    },
    userQuests: [{
        type: ObjectId,
        ref: 'UserQuest',
        childPath: 'requirements'
    }]
});


RequirementSchema.plugin(relationship, {
    relationshipPathName: ['userQuests']
});


/**
 * takes a user and checks whether this requirment is active for him
 * @param  {[type]}  user [description]
 * @return {Boolean}      [description]
 */
RequirementSchema.methods.isActive = function(obj) {
    var res = false;
    switch (this.condition) {
        case '>=':
            res = (obj[this.property] >= this.activation);
            break;
        case '<=':
            res = (obj[this.property] <= this.activation);
            break;
        case '==':
            res = (obj[this.property] === this.activation);
            break;
    }
    return res;
};

var Requirement = module.exports = mongoose.model('Requirement', RequirementSchema);


// when a any or a specific challenge is complete
observer.on('trial.award', function(trial) {
    Promise.fulfilled().then(function() {
        return Requirement.find({
            model1: 'Challenge',
            $or: [{
                id1: {
                    $exists: false
                }
            }, {
                id1: trial.challenge
            }],
            complete: false,
            user: trial.user
        }).exec();
    }).then(function (reqs) {
        return _.map(reqs, function (req) {
            req.completed+=1;
            if(req.completed===req.times) {
                req.complete = true;
            }
            return new Promise(function(resolve, reject) {
                req.save(function(err, model) {
                    if (err) return reject(err);
                    if (model.complete) observer.emit('requirement.complete', req);
                    resolve(model);
                });
            });
        });
    });
});

// every time a challenge in a specific arena is complete
observer.on('arenaTrial.trial.awarded', function(arenaTrial) {
    Promise.fulfilled().then(function() {
        return Requirement.find({
            model1: 'Challenge',
            id1: {
                $exists: false
            },
            model2: 'Arena',
            id2: arenaTrial.arena,
            complete: false,
            user: arenaTrial.user
        }).exec();
    }).then(function(reqs) {
        return _.map(reqs, function(req) {
            req.completed = arenaTrial.completed;
            if (req.completed === req.times) {
                req.complete = true;
            }
            return new Promise(function(resolve, reject) {
                req.save(function(err, model) {
                    if (err) return reject(err);
                    if (model.complete) observer.emit('requirement.complete', req);
                    resolve(model);
                });
            });
        });
    });
});

// whenever any or a specific arena is complete
observer.on('arenaTrial.complete', function(arenaTrial) {
    Promise.fulfilled().then(function() {
        return Requirement.find({
            model1: 'Arena',
            $or: [{
                id1: {
                    $exists: false
                }
            }, {
                id1: arenaTrial.arena
            }],
            complete: false,
            user: arenaTrial.user
        }).exec();
    }).then(function (reqs) {
        return _.map(reqs, function (req) {
            req.completed+=1;
            if(req.completed===req.times) {
                req.complete = true;
            }
            return new Promise(function(resolve, reject) {
                req.save(function(err, model) {
                    if (err) return reject(err);
                    if (model.complete) observer.emit('requirement.complete', req);
                    resolve(model);
                });
            });
        });
    });
});
