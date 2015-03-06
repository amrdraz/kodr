var Promise = require('bluebird');
var mongoose = require('mongoose');
var _ = require('lodash');
var observer = require('../observer');

module.exports = exports = function lastModifiedPlugin(schema, options) {
    var Model = options.model || options;
    schema.plugin(require('./_common_helper'), options);


    /**
     * takes a user and checks whether this requirment is active for him
     * @param  {[type]}  user [description]
     * @return {Boolean}      [description]
     */
    schema.methods.isActive = function(obj) {
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

    schema.methods.getSubject = function() {
        var Model = this.db.model(this.subjectModel);
        var activity = this;
        return Promise.fulfilled().then(function() {
            return Model.findOne({
                _id: activity.subjectId
            }).exec();
        });
    };


    schema.methods.getObject = function() {
        var Model = this.db.model(this.objectModel);
        var activity = this;
        return Promise.fulfilled().then(function() {
            return Model.findOne({
                _id: activity.objectId
            }).exec();
        });
    };


    schema.statics.findByAction = function(act) {
        var Model = this.db.model('Activity');
        return Promise.fulfilled().then(function() {
            return Model.find({
                action: act
            }).exec();
        });
    };

    schema.statics.findByVerb = function(verb) {
        var Model = this.db.model('Activity');
        return Promise.fulfilled().then(function() {
            return Model.find({
                verb: verb
            }).exec();
        });
    };

    schema.statics.new = function(obj) {
        var Model = this.db.model('Activity');
        return Promise.fulfilled().then(function() {
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
};
