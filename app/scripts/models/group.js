module.exports = DS.Model.extend({
    name: DS.attr('string', {
        defaultValue: "new group"
    }),
    exp: DS.attr('number'),
    members: DS.hasMany('member', {
        async: true,
        inverse: 'group'
    }),

    teacherOptions: function() {
        var store = this.store;
        var dfd = DS.PromiseArray.create({
            promise: Em.$.getJSON('api/groups/' + this.get('id') + '/teacherOptions').then(function(response) {
                return response.map(function(record) {
                    record.id = record._id;
                    return store.push('user', record);
                });
            })
        });
        return dfd;
    }.property('members.@each'),
    studentOptions: function() {
        var store = this.store;
        var dfd = DS.PromiseArray.create({
            promise: Em.$.getJSON('api/groups/' + this.get('id') + '/studentOptions').then(function(response) {
                return response.map(function(record) {
                    record.id = record._id;
                    return store.push('user', record);
                });
            })
        });
        return dfd;
    }.property('members.@each')
});
