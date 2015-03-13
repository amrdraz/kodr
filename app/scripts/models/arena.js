var attr = DS.attr;

var ArenaModel = module.exports = DS.Model.extend({
    name: attr('string', {
        defaultValue: "New Arena"
    }),
    description: attr('string', {
        defaultValue: "A new Arena"
    }),
    isPublished: attr('boolean', {defaultValue:false}),
    challenges: DS.hasMany('challenge', {async: true, inverse: 'arena'}),
    trials: DS.hasMany('trial', {async: true, inverse: 'arena'}),
    users: DS.hasMany('arenaTrial', {async: true, inverse: 'arena'}),
    author: DS.belongsTo('user', {async:true, inverse:'arenas'}),
    //vchallenges: DS.hasMany('vchallenge', {async: true, inverse: 'arena'}),
    //vtrials: DS.hasMany('trial', {async: true, inverse: 'arena'}),


    canSave: function() {
        return !this.get('isSaving') && this.get('isDirty') || this.get('isNew');
    }.property('isDirty'),
    canReset: function() {
        return !this.get('isSaving') && this.get('isDirty') && !this.get('isNew');
    }.property('isDirty'),
    canPublish: function() {
        return !this.get('isDirty') && !this.get('isPublished');
    }.property('isDirty', 'isPublished')
});

ArenaModel.FIXTURES = [{
    id: 1,
    name: 'Basic Test',
    challanges:[1],
    vchallenges:[1]
}];
