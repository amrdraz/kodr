module.exports = Em.ObjectController.extend({
    breadCrumb: 'quest',
    breadCrumbPath: 'quest',
    // needs: ['quest'],
    init: function() {
        this._super();
    },
    groupsOptions: function() {
        return this.store.find('group');
    }.property('selectedGroups'),
    unassignedUsersOptions: function() {
        var store = this.store;
        return DS.PromiseArray.create({
            promise: Em.$.getJSON('/api/quests/' + this.get('model.id') + '/unassignedUsersOptions').then(function(res) {
                return res.map(function(record) {
                    record.id = record._id;
                    return store.push('user', record);
                });
            })
        });
    }.property('selected'),
    added: [],
    selected: [],
    selectedGroups: [],
    actions: {
        assign: function() {
            var that = this;
            var groups = this.get('selectedGroups').mapBy('id');
            var users = this.get('selected').mapBy('id');

            if (groups.length || users.length) {
                Em.$.ajax({
                    url: 'api/quests/' + this.get('model.id') + '/assign',
                    type: 'PUT',
                    data: {
                        groups: groups,
                        users: users
                    }
                }).then(function(res) {
                    console.log(res);
                    that.store.pushMany('user',res.users);
                    return that.store.pushMany('userQuest',res.userQuests);
                }, function (err) {
                    console.log(err);
                    toastr.error(err);
                    return false;
                }).then(function (userQuests) {
                    that.get('model.userQuests').then(function (uqs) {
                        uqs.addObjects(userQuests);
                    });
                });
                this.set('selected', []);
                this.get('selectedGroups', []);
            } else {
                toastr.info('You need to pick a user or a group to assign');
            }
            return false;
        },
        remove: function(uq) {
            var that = this;
            Em.RSVP.all([
                uq.get('user.userQuests'),
                this.get('model.userQuests')
            ]).then(function(arr) {
                arr[0] && arr[0].removeObject(uq);
                arr[1].removeObject(uq);
                uq.destroyRecord();
            });
        }
    }
});
