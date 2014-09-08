App.QuestRequirementTransform = DS.Transform.extend({
  deserialize: function(serialized) {
    return serialized.map(function  (req) {
        return App.Requirement.create(req);
    });
  },
  serialize: function(deserialized) {
    console.log('serializing', deserialized);
    return deserialized.map(function (req) {
        return req.serialize();
    });
  }
});

module.exports = DS.Model.extend({
    name: DS.attr('string', {
        defaultValue: "new Quest"
    }),
    description: DS.attr('string'),
    rp: DS.attr('number'),
    requirements: DS.attr('questRequirement', {defaultValue: []}),
    userQuests: DS.hasMany('userQuest', {
        async: true,
        inverse: 'quest'
    }),
    isPublished:DS.attr('boolean', {defaultValue:false}),
    users: function () {
        return this.get('userQuests').getEach('user');
    }.property('userQuests.@each.relationshipsLoaded'),

    canSave: function() {
        return this.get('isNew') || (!this.get('isSaving') && this.get('isDirty') && !this.get('isPublished'));
    }.property('isDirty', 'isPublished'),
    canReset: function() {
        return !this.get('isSaving') && this.get('isDirty') && !this.get('isNew');
    }.property('isDirty'),
    canPublish: function() {
        return !this.get('canSave')&& !this.get('isPublished');
    }.property('canSave')
    // usersOptions: function() {
    //     var store = this.store;
    //     var dfd = DS.PromiseArray.create({
    //         promise: Em.$.getJSON('api/quests/' + this.get('id') + '/usersOptions').then(function(response) {
    //             return response.map(function(record) {
    //                 record.id = record._id;
    //                 return store.push('user', record);
    //             });
    //         })
    //     });
    //     return dfd;
    // }.property('users.@each')
});
