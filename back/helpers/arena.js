var Promise = require('bluebird');
var _ = require('lodash');
var observer = require('../observer');

module.exports = exports = function lastModifiedPlugin(schema, options) {
    var Model  = options.model || options;
    schema.plugin(require('./_common_helper'), options);


    schema.statics.getByIdChallenges = function (id) {
        var Arena = this.db.model(Model);
        var Challenge = this.db.model('Challenge');
        return Promise.fulfilled().then(function () {
            return Challenge.find({arena:id}).sort('order').exec();
        });
    };

    schema.statics.getByIdWithChallanges = function (id) {
        var Arena = this.db.model(Model);
        return Promise.fulfilled().then(function () {
           return [Arena.getById_404(id), Arena.getByIdChallenges(id)]; 
        });
    };

    schema.methods.getUserArenaByUserId = function (userId) {
        var arena = this;
        var UserArena = this.db.model('UserArena');
        return Promise.fulfilled().then(function () {
            var obj = {arena:arena.id, user:userId};
            return UserArena.getOneByQueryOrCreate(obj, obj); 
        });
    };
    schema.statics.getArenaWithUserArenaByUserId = function (id, userId) {
        var Arena = this.db.model(Model);
        var UserArena = this.db.model('UserArena');
        return Promise.fulfilled().then(function (arena) {
            var obj = {arena:id, user:userId};
            return UserArena.getOneByQueryOrCreate(obj, obj); 
        }).then(function (ua) {
            return [Arena.getById_404(id), ua];
        });
    };
};
