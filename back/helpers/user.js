var Promise = require('bluebird');
var _ = require('lodash');
var generateName = require('sillyname');
var debounce = _.debounce;
var observer = require('../observer');

module.exports = exports = function lastModifiedPlugin(schema, options) {


    schema.statics.getById = function(id) {
        var User = this.db.model('User');
        return Promise.fulfilled().then(function() {
            return User.findOne({
                _id: id
            }).exec();
        });
    };
    schema.statics.getByIds = function(ids) {
        var User = this.db.model('User');
        return Promise.fulfilled().then(function() {
            return User.find({
                _id: {$in:ids}
            }).exec();
        });
    };
    schema.statics.getById_404 = function(id) {
        var User = this.db.model('User');
        return User.getById(id).then(function(g) {
            if (!g) throw {
                http_code: 404,
                message: "Not Found"
            };
            return g;
        });
    };

    schema.statics.findOrCreate = function(memb) {
        var User = this.db.model('User');
        return Promise.fulfilled().then(function () {
            return User.findOne({group:memb.group, user:memb.user}).exec();
        }).then(function(m) {
            if (m) return m;
            return User.create(memb);
        });
    };

};
