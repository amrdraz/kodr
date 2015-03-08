var Promise = require('bluebird');
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
var _ = require('lodash');
var observer = require('../observer');

module.exports = exports = function lastModifiedPlugin(schema, options) {
    var modelName = options.model || options;

    schema.add({
        'fulfilled': {
            type: Boolean,
            default: options.default || false
        },
        'requirements': [{
            type: ObjectId,
            ref: 'Requirement'
        }]
    });

    /**
     * Parses an array of requirement definitions making sure to reduce redundency
     * by finding already existing requirments and linking them to the Model
     * also takes into consideration the current progress of the previous requirments (req),
     *     for instance if a req has `completed 2` out of `3 times` and the new similar def for this user is `times 2`
     *     then a new req is created wth `completed 2` and `complete true`, is the new def is `times 4` then a new req
     *     is created with `completed 2`, `complete false` and `times 4`
     * @param {Array} requirements array of requirement definitions
     * @returns {Promise} A promise with value model
     */
    schema.methods.setRequirements = function(requirements) {
        var model = this;
        var Requirement = model.db.model('Requirement');
        return Promise.map(requirements, function(r) {
            r.times = r.times || 1;
            r.user = model.user;
            // console.log(r);
            var query = {
                model1: r.model1,
                id1: r.id1,
                model2: r.model2,
                id2: r.id2,
                user: model.user
            };
            // console.log(query);
            return Promise.fulfilled().then(function() {
                return Requirement.findOne(query).sort('-times').exec();
            }).then(function(req) {
                if (req && req.times === r.times) { //requirment already exist with exaclty the same number of times
                    var length = req.userQuests.length;
                    req.userQuests.push(model._id);
                    var userQuests = _.uniq(req.userQuests, function(id) {
                        return id.toString();
                    });
                    if (length !== userQuests.length) {
                        req.userQuests = userQuests;
                        req.markModified('userQuests');
                        return new Promise(function(resolve, reject) {
                            req.save(function(err, model) {
                                if (err) return reject(err);
                                resolve(model);
                            });
                        });
                    }
                    return req;
                    // return Requirement.findOneAndUpdate({
                    //     _id: req._id
                    // }, {
                    //     $addToSet: {
                    //         userQuests: model._id //add model is not already there
                    //     }
                    // }, {
                    //     safe: true,
                    //     upsert: true
                    // }).exec();
                } else {
                    if (req) { // a similar req already exist but differen repat times
                        r.completed = Math.min(req.completed, r.times);
                        r.complete = r.completed === r.times;
                    }
                    r.userQuests = [model.id];
                    return Requirement.create(r);
                }
            });
        }).then(function(reqs) {
            var Model = model.db.model(modelName);
            return Model.findOne({
                _id: model.id
            }).populate('requirements').exec();
        });
    };

    schema.methods.unlock = function() {
        var doc = this;
        doc.lock = true;
        return new Promise(function(res, rej) {
            doc.save(function(err, model) {
                if (err) return rej(err);
                res(model);
            });
        });
    };

};
