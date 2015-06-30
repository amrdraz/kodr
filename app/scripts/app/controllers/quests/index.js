import Ember from 'ember';

module.exports = Ember.Controller.extend({

    actions: {
      remove: function(quest) {
            if (confirm('Are you sure you want to remove this quest?')) {
                quest.deleteRecord();
                quest.save();
            }
            return false;
        }
    }
});

export default undefined;
