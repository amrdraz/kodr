var Promise = require('bluebird');
var _ = require('lodash');
var observer = require('../observer');

module.exports = exports = function lastModifiedPlugin(schema, options) {
    var Model  = options.model || options;
    schema.plugin(require('./_common_helper'), options);


    schema.statics.getByIdChallenges = function (id) {
        var Arena = this.db.model(Model);
        var Challenge = this.db.model('Challenge');
        var VChallenge = this.db.model('VChallenge');
        return Promise.fulfilled().then(function () {
            return Challenge.find({arena:id}).sort('order').exec().then(function () {
                return VChallenge.find({arena:id}).sort('order').exec();
            })
        });
    };

    schema.statics.getByIdWithChallanges = function (id) {
        var Arena = this.db.model(Model);
        return Promise.fulfilled().then(function () {
           return [Arena.getById_404(id), Arena.getByIdChallenges(id)]; 
        });
    };
};
