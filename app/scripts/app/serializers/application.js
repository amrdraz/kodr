import DS from 'ember-data';

var ApplicationSerializer = DS.RESTSerializer.extend({
    primaryKey: '_id'
});

export default ApplicationSerializer;
