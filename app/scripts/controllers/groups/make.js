module.exports = Em.Controller.extend({
    actions: {
        submit: function(group) {
            var controller = this;
            Em.$.post('api/groups/many', this.get('model').getProperties(['name','from', 'to'])).done(function (res) {
                controller.store.pushPayload(res);
                controller.transitionToRoute('groups');
            }).fail(function (err) {
                console.log(err);
            });
        }
    }
});
