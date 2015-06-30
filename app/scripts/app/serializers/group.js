import DS from 'ember-data';

var GroupSerializer = DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, {
    primaryKey: '_id',
    attrs: {
        // author: {embedded: 'always'},
        members: {
            serialize: 'ids'
        }
    }
});

export default GroupSerializer;
