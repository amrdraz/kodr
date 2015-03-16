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

    schema.methods.getModel1 = function() {
        var Model = this.db.model(this.model1);
        var requirement = this;
        return Promise.fulfilled().then(function() {
            return Model.findOne({
                _id: requirement.id1
            }).exec();
        });
    };


    schema.methods.getModel2 = function() {
        var Model = this.db.model(this.model2);
        var requirement = this;
        return Promise.fulfilled().then(function() {
            return Model.findOne({
                _id: requirement.id2
            }).exec();
        });
    };

    schema.statics.new = function(obj) {
        var Model = this.db.model(Model);
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
