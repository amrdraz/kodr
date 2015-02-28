var Promise = require('bluebird');
var _ = require('lodash');
var generateName = require('sillyname');
var debounce = _.debounce;
var observer = require('../observer');
var User = require('../models/user');

module.exports = exports = function lastModifiedPlugin(schema, options) {

    var Model  = options.model || options;
    schema.plugin(require('./_common_helper'), options);
    

    schema.statics.findOrCreate = function(memb) {
        var Member = this.db.model('Member');
        return Member.findOneByQueryOrCreate({group:memb.group, user:memb.user},memb);
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
