module.exports = App.ChallengeEditController = Em.ObjectController.extend({
    // needs: [],
    actions: {
        reset: function() {
            this.get('model').rollback();
        },
        save: function() {
            var that = this;
            this.get('model').save().then(function(ch) {
                that.transitionToRoute('challenge.edit', ch.get('id'));
            });
        },
        delete: function() {
            this.get('model').destroyRecord();
            this.transitionToRoute('challenges');
        },
        validate: function() {
            
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
