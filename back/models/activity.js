var mongoose = require('mongoose');
var Promise = require('bluebird');
var util = require('util');
var _ = require('lodash');
var ObjectId = mongoose.Schema.Types.ObjectId;
var Mixed = mongoose.Schema.Types.Mixed;
var relationship = require("mongoose-relationship");

/**
 * Activity Schema.
 * The Activity tracks user actions on the system, a sort of logging
 * @param {User} subject the person who made acted
 * @param {String} action the action inacted by the subject, actions follow the format
 *     user `passed` challenge
 *     user `tried` challenge
 *     user `gained` exp from challenge in arena
 *     user `posted` on discussion
 *     user `posted` on comment
 * @param {Sting} object object that was acted upon
 * @param {ObjectId} objectId The refrence to the object
 * @type {mongoose.Schema}
 */

var ActivitySchema = new mongoose.Schema({
    subjectModel: String,
    subjectId: ObjectId,
    verb: {
        type: String,
        // 'enum': ['signedout','signedin','signedup','activated','verified','created', 'updated', 'deleted', 'viewed','started', 'tried', 'gained', 'posted','joined', 'completed', 'awarded']
    },
    action: String,
    objectModel: String,
    objectId: ObjectId,
    objectMeta:Mixed,
    time: {
        type:Date,
        default: Date.now
    }
});

ActivitySchema.methods.getSubject = function () {
    var Model = this.db.model(this.subjectModel);
    var activity = this;
    return Promise.fulfilled().then(function() {
        return Model.findOne({
            _id: activity.subjectId
        }).exec();
    });
};


ActivitySchema.methods.getObject = function () {
    var Model = this.db.model(this.objectModel);
    var activity = this;
    return Promise.fulfilled().then(function() {
        return Model.findOne({
            _id: activity.objectId
        }).exec();
    });
};


ActivitySchema.statics.findByAction = function (act) {
    var Model = this.db.model('Activity');
    return Promise.fulfilled().then(function () {
        return Model.find({action:act}).exec();
    });
};

ActivitySchema.statics.findByVerb = function (verb) {
    var Model = this.db.model('Activity');
    return Promise.fulfilled().then(function () {
        return Model.find({verb:verb}).exec();
    });
};

ActivitySchema.statics.new = function (obj) {
    var Model = this.db.model('Activity');
    return Promise.fulfilled().then(function () {
        if (obj.subject) {
            obj.subjectId = obj.subject.id;
            obj.subjectModel = obj.subject.constructor.modelName;
        }
        if (obj.object) {
            obj.objectId = obj.object.id;
            obj.objectModel = obj.object.constructor.modelName;
        }
        return Model.create(obj);
    });
};


module.exports = mongoose.model('Activity', ActivitySchema);
