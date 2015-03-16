var Promise = require('bluebird');
var _ = require('lodash');
var generateName = require('sillyname');
var debounce = _.debounce;
var observer = require('../observer');

module.exports = exports = function lastModifiedPlugin(schema, options) {
    schema.plugin(require('./_common_helper'), options);

    // /**
    //  * Parses an array of requirement definitions making sure to reduce redundency
    //  * by finding already existing requirments and linking them to the UserQuest
    //  * also takes into consideration the current progress of the previous requirments (req),
    //  *     for instance if a req has `completed 2` out of `3 times` and the new similar def for this user is `times 2`
    //  *     then a new req is created wth `completed 2` and `complete true`, is the new def is `times 4` then a new req
    //  *     is created with `completed 2`, `complete false` and `times 4`
    //  * @param {Array} requirements array of requirement definitions
    //  * @returns {Promise} A promise with value userQuest
    //  */
    // schema.methods.setRequirements = function(requirements) {
    //     var userQuest = this;
    //     var Requirement = userQuest.db.model('Requirement');
    //     return Promise.map(requirements, function(r) {
    //         r.times = r.times || 1;
    //         r.user = userQuest.user;
    //         // console.log(r);
    //         var query = {
    //             model1: r.model1,
    //             id1: r.id1,
    //             model2: r.model2,
    //             id2: r.id2,
    //             user: userQuest.user
    //         };
    //         // console.log(query);
    //         return Promise.fulfilled().then(function () {
    //             return Requirement.findOne(query).sort('-times').exec();
    //         }).then(function(req) {
    //             if (req && req.times === r.times) { //requirment already exist with exaclty the same number of times
    //                 var length = req.userQuests.length;
    //                 req.userQuests.push(userQuest._id);
    //                 var userQuests = _.uniq(req.userQuests, function(id) {
    //                     return id.toString();
    //                 });
    //                 if (length!==userQuests.length) {
    //                     req.userQuests = userQuests;
    //                     req.markModified('userQuests');
    //                     return new Promise(function (resolve,reject) {
    //                         req.save(function(err, model) {
    //                             if(err) return reject(err);
    //                             resolve(model);
    //                         });
    //                     });
    //                 }
    //                 return req;
    //                 // return Requirement.findOneAndUpdate({
    //                 //     _id: req._id
    //                 // }, {
    //                 //     $addToSet: {
    //                 //         userQuests: userQuest._id //add userQuest is not already there
    //                 //     }
    //                 // }, {
    //                 //     safe: true,
    //                 //     upsert: true
    //                 // }).exec();
    //             } else {
    //                 if (req) { // a similar req already exist but differen repat times
    //                     r.completed = Math.min(req.completed, r.times);
    //                     r.complete = r.completed === r.times;
    //                 }
    //                 r.userQuests = [userQuest.id];
    //                 return Requirement.create(r);
    //             }
    //         });
    //     }).then(function(reqs) {
    //         var UserQuest = userQuest.db.model('UserQuest');
    //         return UserQuest.findOne({
    //             _id: userQuest.id
    //         }).populate('requirements').exec();
    //     });
    // };

    schema.getUser = function () {
        var User = this.db.model('User');
        var uq = this;
        return Promise.fulfilled().then(function () {
            return User.findOne({_id:uq.user}).exec();
        });
    };

    schema.getQuest = function () {
        var Quest = this.db.model('Quest');
        var uq = this;
        return Promise.fulfilled().then(function () {
            return Quest.findOne({_id:uq.quest}).exec();
        });
    };

};
