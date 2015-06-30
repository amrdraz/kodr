import DS from 'ember-data';

var attr = DS.attr;
var ArenaModel = module.exports = DS.Model.extend({
    name: attr('string', {
        defaultValue: "New Arena"
    }),
    description: attr('string', {
        defaultValue: "A new Arena"
    }),
    fllow: attr('string', {
        defaultValue: "any"
    }),
    fllowType: ['any', 'sequencial'],
    isPublished: attr('boolean', {defaultValue:false}),
    challenges: DS.hasMany('challenge', {async: true, inverse: 'arena'}),
    trials: DS.hasMany('trial', {async: true, inverse: 'arena'}),
    users: DS.hasMany('arenaTrial', {async: true, inverse: 'arena'}),
    author: DS.belongsTo('user', {async:true, inverse:'arenas'}),


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

export default undefined;
