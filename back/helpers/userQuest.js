var Promise = require('bluebird');
var _ = require('lodash');
var generateName = require('sillyname');
var debounce = _.debounce;
var observer = require('../observer');

module.exports = exports = function lastModifiedPlugin(schema, options) {

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

    schema.statics.getById = function(id) {
        var UserQuest = this.db.model('UserQuest');
        return Promise.fulfilled().then(function() {
            return UserQuest.findOne({
                _id: id
            }).exec();
        });
    };

    schema.statics.getById_404 = function(id) {
        var UserQuest = this.db.model('UserQuest');
        return UserQuest.getById(id).then(function(g) {
            if (!g) throw {
                http_code: 404,
                message: "Not Found"
            };
            return g;
        });
    };

    schema.statics.findOrCreate = function(memb) {
        var UserQuest = this.db.model('UserQuest');
        return Promise.fulfilled().then(function () {
            return UserQuest.findOne({group:memb.group, user:memb.user}).exec();
        }).then(function(m) {
            if (m) return m;
            return UserQuest.create(memb);
        });
    };

};
