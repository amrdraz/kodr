import Ember from 'ember';

module.exports = Ember.Controller.extend({

    actions: {
      remove: function(group) {
            if (confirm('Are you sure you want to remove this group?')) {
                group.deleteRecord();
                group.save();
            }
            return false;
        }
    }
});

export default undefined;
