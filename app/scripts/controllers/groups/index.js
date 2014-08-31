module.exports = Em.ArrayController.extend({

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
