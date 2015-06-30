import DS from 'ember-data';

// ApplicationAdapter = DS.FixtureAdapter;
var ApplicationAdapter = DS.RESTAdapter.extend({
    namespace: 'api',
    coalesceFindRequests: true
});

export default ApplicationAdapter;
