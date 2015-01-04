var Promise = require('bluebird');
var _ = require('lodash');
var generateName = require('sillyname');
var debounce = _.debounce;
var observer = require('../observer');

module.exports = exports = function lastModifiedPlugin(schema, options) {


    schema.methods.assign = function(userId) {
        var Quest = this.db.model('Quest');
        return Quest.assign(userId, this);
    };

    /**
     * Assign quest to user or updates requirements if already assigned
     * @param  {ObjectId} userId  [description]
     * @param  {Quest} quest [description]
     * @return {UserQuest}       [description]
     */
    schema.statics.assign = function(userId, quest) {
        if(!quest.isPublished) return Promise.reject('You can not assign an Un-Published quest');
        var UserQuest = this.db.model('UserQuest');
        return Promise.fulfilled().then(function() {
            return UserQuest.create({
                name:quest.name,
                description:quest.description,
                rp:quest.rp,
                quest: quest.id,
                user: userId
            }).then(function (uq) {
                observer.emit('quest.join', uq);
                return uq.setRequirements(quest.requirements);
            });
        });
    };

    schema.statics.getById = function(id) {
        var Quest = this.db.model('Quest');
        return Promise.fulfilled().then(function() {
            return Quest.findOne({
                _id: id
            }).exec();
        });
    };
    schema.statics.getById_404 = function(id) {
        var Quest = this.db.model('Quest');
        return Quest.getById(id).then(function(g) {
            if (!g) throw {
                http_code: 404,
                message: "Not Found"
            };
            return g;
        });
    };

    schema.statics.findOrCreate = function(memb) {
        var Quest = this.db.model('Quest');
        return Promise.fulfilled().then(function () {
            return Quest.findOne({group:memb.group, user:memb.user}).exec();
        }).then(function(m) {
            if (m) return m;
            return Quest.create(memb);
        });
    };

    schema.statics.getGroups = function(user) {
        var Quest = this.db.model('Quest');
        return Promise.fulfilled().then(function() {
            return Quest.find({
                user: user.id
            }).populate('group').exec();
        }).then(function (memeberships) {
            return _.map(memeberships, 'group');
        });
    };

};
