module.exports = Ember.Route.extend(SimpleAuth.ApplicationRouteMixin, {
    actions: {
        loading: function(transition, originRoute) {
            // displayLoadingSpinner();
            // this.woof.info('did you know that the best programs are lazy ones');
            // substate implementation when returning `true`
            return true;
        }
    }
});
