import Ember from 'ember';

// Route views
var ApplicationView = require('./views/application');
module.exports = Ember.View.extend({
    didInsertElement: function() {
//         window.onbeforeunload = function (e) {
//     e = e || window.event;

//     // For IE and Firefox prior to version 4
//     if (e) {
//         e.returnValue = 'Sure?';
//     }

//     // For Safari
//     return 'Sure?';
// };
    }
});

export default ApplicationView;
