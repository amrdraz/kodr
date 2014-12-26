var Promise = require('bluebird');
var _ = require('lodash');
var generateName = require('sillyname');
var debounce = _.debounce;
var observer = require('../observer');
var User = require('../models/user');

module.exports = exports = function lastModifiedPlugin(schema, options) {


    schema.statics.getById = function(id) {
        var Member = this.db.model('Member');
        return Promise.fulfilled().then(function() {
            return Member.findOne({
                _id: id
            }).exec();
        });
    };
    schema.statics.getById_404 = function(id) {
        var Member = this.db.model('Member');
        return Member.getById(id).then(function(g) {
            if (!g) throw {
                http_code: 404,
                message: "Not Found"
            };
            return g;
        });
    };

    schema.statics.findOrCreate = function(memb) {
        var Member = this.db.model('Member');
        return Promise.fulfilled().then(function () {
            return Member.findOne({group:memb.group, user:memb.user}).exec();
        }).then(function(m) {
            if (m) return m;
            return Member.create(memb);
        });
    };

    schema.statics.getGroups = function(user) {
        var Member = this.db.model('Member');
        return Promise.fulfilled().then(function() {
            return Member.find({
                user: user.id
            }).populate('group').exec();
        }).then(function (memeberships) {
            return _.map(memeberships, 'group');
        });
    };

};
