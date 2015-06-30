import Ember from 'ember';

var GroupsRoute = require('./routes/groups');
module.exports = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin,{
    // activate: function() {},
    // deactivate: function() {},
    // setupController: function(controller, model) {},
    // renderTemplate: function() {},
    // beforeModel: function() {},
    // afterModel: function() {},

    model: function() {
        return this.store.find('group');
    }
});

export default GroupsRoute;
