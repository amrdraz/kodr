module.exports = App.ChallengeEditController = Em.ObjectController.extend({
    needs: ['challenge'],
    actions: {
        run: function() {
            this.get('controllers.challenge').send('run');
        },
        validate: function() {
            this.get('controllers.challenge').send('run');
        },
        reset: function() {
            this.get('model').rollback();
        },
        save: function() {
            var that = this;
            this.get('model').save().then(function(ch) {
                if (App.get('currentPath').contains('create'))
                    that.transitionToRoute('challenge.edit', ch.get('id'));
            }).fail(function(xhr) {
                that.set('errorMessage', xhr.responseText);
            });
        },
        delete: function() {
            this.get('model').destroyRecord();
            this.transitionToRoute('challenges');
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
        }

    }
});
