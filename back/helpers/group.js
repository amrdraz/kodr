var Promise = require('bluebird');
var _ = require('lodash');
var generateName = require('sillyname');
var debounce = _.debounce;
var observer = require('../observer');
var Member = require('../models/member');
var User = require('../models/user');

module.exports = exports = function lastModifiedPlugin(schema, options) {

    schema.methods.getLeaders = function() {
        return Promise.fulfilled().then(function() {
            return Member.find({
                group: this.id,
                role: 'leader'
            }).exec();
        });
    };

    schema.methods.getSubscribers = function() {
        return Promise.fulfilled().then(function() {
            return Member.find({
                group: this.id,
                role: 'subscriber'
            }).exec();
        });
    };

    schema.methods.getOwners = function() {
        return Promise.fulfilled().then(function() {
            return Member.find({
                group: this.id,
                role: 'owner'
            }).exec();
        });
    };

    schema.methods.getMembers = function() {
        return Promise.fulfilled().then(function() {
            return Member.find({
                group: this.id
            }).exec();
        });
    };


    schema.methods.getUsers = function(id) {
        return Promise.fulfilled().then(function() {
            Member.find({
                group: id
            }).populate('user').exec();
        }).then(function(members) {
            return _.map(members, 'user');
        });
    };
    /**
     * checks if user is a member of the group
     * @param  Number user 
     * @return {Promise}        Promise with group member.
     */
    schema.methods.getIfMember = function(options) {
        var uid;
        if (_.isString(options)) {
            uid = options;
        } else {
            uid = options.isUser ? options.id : options.user.id;
        }
        var group = this;
        return Promise.fulfilled().then(function() {
            return Member.findOne({
                group: group.id,
                user: uid,
            }).exec();
        });
    };
    
    /**
     * throws 404 if memebr not found
     * @param  {[type]} uid [description]
     * @return {[type]}     [description]
     */
    schema.methods.getMember_404 = function(user) {
        var group = this;
        return group.getIfMember(user).then(function (memb) {
            if (!memb) throw {
                http_code: 404,
                message: "Not Found"
            };
            return memb;
        });
    };

    /**
     * @throws 404 if memebr not found
     * @param  {[type]} uid [description]
     * @return {[type]}     [description]
     */
    schema.methods.removeMember = function(uid) {
        var group = this;
        return group.getMember_404(uid).then(function (memb) {
            return new Promise(function (res,rej) {
                memb.remove(function (err) {
                    if (err) return rej(err);
                    return res(memb);
                });
            });
        });
    };

    schema.methods.canUpdate = function(user) {
        var uid;
        if (_.isString(user)) {
            uid = user;
        } else {
            uid = user.id;
        }
        var group = this;
        return group.getMember_404(uid).then(function(member) {
            if (member.isSubscriber) {
                throw {http_code:401, message:"no premission to edit group"};
            }
            return member;
        });
    };


    /**
     * Adds user as a new member to group, creating a new member and adding it to the groups members list
     * @param  {User|Object} options options can either be a user or an object containing user model as a key
     *                          - user: user to add
     *                          - group_role: role in group defaults depending on user role
     *                          - active: whether he is an active user, defaults depending on role of user
     * @return {Promise}        Promise with group member added as parameter.
     */
    schema.methods.join = function(options) {
        var user = options.isUser ? options : options.user;

        var group = this;
        return Promise.fulfilled().then(function() {
            return Member.create({
                group: group.id,
                user: user.id,
                uname: user.username,
                gname: group.name,
                role: options.group_role || (user.isStudent ? 'subscriber' : 'leader'),
                isActive: options.isActive || !user.isStudent,
                status: user.isStudent ? (options.isActive ? 'current' : 'new') : 'current',
            });
        }).then(function(member) {
            group.members.push(member);
            return member;
        });
    };

    schema.methods.addMember = function(uid) {
        var group = this;
        return Promise.fulfilled().then(function() {
            return User.findOne({_id:uid}).exec();
        }).then(function(user) {
            if(!user) throw {http_code: 404, message:"user not found"};
            return group.join(user);
        });
    };

    schema.methods.addMembers = function(uids) {
        var group = this;
        return Promise.fulfilled().then(function() {
            return User.find({_id:{$in:uids}}).exec();
        }).then(function(users) {
            return Promise.map(users, function (user) {
               return group.join(user);
            });
        });
    };

    schema.statics.getById = function(id) {
        var Group = this.db.model('Group');
        return Promise.fulfilled().then(function() {
            return Group.findOne({
                _id: id
            }).exec();
        });
    };
    schema.statics.getById_404 = function(id) {
        var Group = this.db.model('Group');
        return Group.getById(id).then(function(g) {
            if (!g) throw {
                http_code: 404,
                message: "Not Found"
            };
            return g;
        });
    };

    schema.statics.getMembers = function(id) {
        return Promise.fulfilled().then(function() {
            return Member.find({
                group: id
            }).exec();
        });
    };

    schema.statics.getWithMembers = function(id) {
        var Group = this.db.model('Group');
        return Promise.fulfilled().then(function() {
            return [Group.getById_404(id), Group.getMembers(id)];
        });
    };

    schema.statics.getGroups = function(user) {
        var Group = this.db.model('Group');
        return Promise.fulfilled().then(function() {
            return Member.find({
                user: user.id
            }).populate('group').exec();
        }).then(function (memeberships) {
            return _.map(memeberships, 'group');
        });
    };

    schema.statics.findOrCreateByName = function(name) {
        var Group = this.db.model('Group');
        return Promise.fulfilled().then(function() {
            return Group.findOne({
                name: name
            }).exec();
        }).then(function (group) {
            if (group) {return group;}
            return Group.create({name:name});
        });
    };

    schema.statics.addMember = function(gid, uid) {
        var Group = this.db.model('Group');
        return Group.getById_404(gid).then(function(group) {
            return [group, group.addMember(uid)];
        });
    };

    schema.statics.addMembers = function(gid, uids) {
        var Group = this.db.model('Group');
        return Group.getById_404(gid).then(function(group) {
            return [group, group.addMembers(uids)];
        });
    };

    schema.statics.removeMember = function(gid, uid) {
        var Group = this.db.model('Group');
        return Group.getById_404(gid).then(function (group) {
            return [group, group.removeMember(uid)];
        }).spread(function (g, member) {
            return g;
        });
    };
};
