import Ember from 'ember';

module.exports = Ember.Controller.extend({
    actions: {
        submit: function(group) {
            var controller = this;
            Ember.$.post('api/groups/many', this.get('model').getProperties(['name','from', 'to'])).done(function (res) {
                controller.store.pushPayload(res);
                controller.transitionToRoute('groups');
            }).fail(function (err) {
                console.log(err);
            });
        }
    }
});

export default undefined;
