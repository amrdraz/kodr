module.exports = Em.ObjectController.extend({
    breadCrumb: 'group',
    breadCrumbPath: 'group',
    // needs: ['group'],
    init: function() {
        this._super();
    },
    isCreating: function () {
        return App.get('currentPath').split('.').contains('create');
    }.property('App.currentPath'),
    selectedTeachers: [],
    selectedStudents: [],
    actions: {
        save: function() {
            var that = this;
            if (this.get('model.isDirty')) {
                this.get('model').save().then(function (g) {
                    if (App.get('currentPath').split('.').contains('create'))
                        that.transitionToRoute('group.edit', g);
                });
            }
            if (this.get('selectedTeachers').length) {
                console.log(this.get('selectedTeachers').mapBy('id'));
                Em.$.ajax({
                    url: '/api/groups/' + this.get('model.id') + '/members',
                    method:'POST',
                    data: {
                        uids: this.get('selectedTeachers').mapBy('id')
                    }
                }).done(function(members) {
                    that.store.pushPayload(members);
                    that.set('selectedTeachers', []);
                });
            }
            if (this.get('selectedStudents').length) {
                Em.$.ajax({
                    url: '/api/groups/' + this.get('model.id') + '/members',
                    method:'POST',
                    data: {
                        uids: this.get('selectedStudents').mapBy('id')
                    }
                }).done(function(members) {
                    that.store.pushPayload(members);
                    that.set('selectedStudents', []);
                });
            }
        },
        delete: function() {
            var newModel = this.get('model.isNew');
            this.get('model').destroyRecord();
            if (!newModel) {
                this.get('model').save();
            }
            this.transitionToRoute('groups');
        },
        remove: function(user) {
            var that = this;
            var model = this.get('model');
            model.get('members').then(function(members) {
                members.removeObject(user);
                Em.$.ajax({
                    url: '/api/groups/' + model.id + '/members/' + user.id,
                    type: 'DELETE'
                });
            });
        }
    }
});
