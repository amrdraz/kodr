var attr = DS.attr;

var ArenaModel = module.exports = DS.Model.extend({
    name: attr('string', {
        defaultValue: "New Arena"
    }),
    description: attr('string', {
        defaultValue: "A new Arena"
    }),
    challenges: DS.hasMany('challenge', {async: true, inverse: 'arena'}),

    canSave: function() {
        return this.get('isDirty') || this.get('isNew');
    }.property('isDirty'),
    canReset: function() {
        return this.get('isDirty') && !this.get('isNew');
    }.property('isDirty'),
    canPublish: function() {
        return !this.get('isDirty') && !this.get('isPublished');
    }.property('isDirty', 'isPublished')
});

ArenaModel.FIXTURES = [{
    id: 1,
    name: 'Basic Test',
    challanges:[1]
}];
