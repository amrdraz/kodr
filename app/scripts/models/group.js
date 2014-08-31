module.exports = DS.Model.extend({
    name: DS.attr('string', {
        defaultValue: "new group"
    }),
    exp: DS.attr('number'),

    founder: DS.belongsTo('user', {
        async: true,
        inverse: 'groups'
    }),
    members: DS.hasMany('user', {
        async: true,
        inverse: 'group'
    }),

    membersOptions: function() {
        var store = this.store;
        var dfd = DS.PromiseArray.create({
            promise: Em.$.getJSON('api/groups/' + this.get('id') + '/membersOptions').then(function(response) {
                return response.map(function(record) {
                    record.id = record._id;
                    return store.push('user', record);
                });
            })
        });
        return dfd;
    }.property('members.@each')
});
