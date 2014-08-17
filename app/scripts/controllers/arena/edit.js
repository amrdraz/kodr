module.exports = Em.ObjectController.extend({
    needs: ['arena'],
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
            this.get('model').destroyRecord();
            this.transitionToRoute('arenas');
        },
        publish: function() {
            this.set('model.isPublished', true);
            this.get('model').save().then(function(ch) {
                console.log('published');
            });
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
        togglePublishChallenge: function(challenge) {
            var published = challenge.get('isPublished');
            if (confirm('Are you sure you want to '+(published?'un-publish':'publish')+' this challenge?')) {
                challenge.set('isPublished', !challenge.get('isPublished'));
                challenge.save();
            }
        },
        removeChallenge: function(challenge) {
            if (confirm('Are you sure you want to remove this challenge?')) {
                challenge.deleteRecord();
                challenge.save();

            }
        }

    }
});
