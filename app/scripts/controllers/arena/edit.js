var toastr = require('toastr');
module.exports = Em.ObjectController.extend({
    breadCrumb:'arena',
    breadCrumbPath:'arena',
    needs: ['arena'],
    canPublish: function () {
        return this.get('model.canPublish') && this.get('model.challenges').filterProperty('isPublished', true).length>=1;
    }.property('model.challenges.@each.isPublished'),
    actions: {
        reset: function() {
            this.get('model').rollback();
        },
        save: function() {
            var that = this;
            this.get('model').save().then(function(ch) {
                if (App.get('currentPath').contains('create'))
                    that.transitionToRoute('arena.edit', ch.get('id'));
            }).catch(function(xhr) {
                that.set('errorMessage', xhr.responseText);
            });
        },
        delete: function() {
            var newModel = this.get('model.isNew');
            this.get('model').destroyRecord();
            if(!newModel) {
                this.get('model').save();
            }
            this.transitionToRoute('arenas');
        },
        publish: function() {
            var model = this.get('model');
            if(this.get('canPublish')) {
                this.set('model.isPublished', true);
                this.get('model').save().then(function(ch) {
                    console.log('published');
                });
            } else {
                toastr.info('You can not publish an Arena without having at least one published challenge');
            }
        },
        unPublish: function() {
            this.set('model.isPublished', false);
            this.get('model').save().then(function(ch) {
                console.log('unPublished');
            });
        },
        add: function() {
            this.transitionToRoute('challenges.create', {
                queryParams: {
                    arena: this.get('model')
                }
            });
        },
        removeChallenge: function(challenge) {
            if (confirm('Are you sure you want to remove this challenge?')) {
                challenge.deleteRecord();
                challenge.save();

            }
        }

    }
});
