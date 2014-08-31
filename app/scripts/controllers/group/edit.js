module.exports = Em.ObjectController.extend({
    breadCrumb: 'group',
    breadCrumbPath: 'group',
    // needs: ['group'],
    init: function() {
        this._super();
    },
    students: function() {
        return this.get('model').membersOptions();
    }.property(),
    selected: [],
    actions: {
        save: function() {
            var that = this;
            this.get('model.members').then(function(members) {
                if(that.get('selected').length) {
                    members.addObjects(that.get('selected'));
                    that.set('selected', []);
                } 
                that.get('model').save().then(function(g) {
                    if (App.get('currentPath').split('.').contains('create'))
                        that.transitionToRoute('group.edit', g);
                }).catch(function(xhr) {
                    that.set('errorMessage', xhr.responseText);
                });
            });
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
                    url: '/api/groups/'+model.id+'/members/'+user.id,
                    type: 'DELETE'
                });
            });
        }
    }
});
