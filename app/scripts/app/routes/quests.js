import Ember from 'ember';

var QuestsRoute = require('./routes/quests');
module.exports = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin,{
    // activate: function() {},
    // deactivate: function() {},
    // setupController: function(controller, model) {},
    // renderTemplate: function() {},
    // beforeModel: function() {},
    // afterModel: function() {},

    model: function() {
        return this.store.find('quest');
    }
});

export default QuestsRoute;
