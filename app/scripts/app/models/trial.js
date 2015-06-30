import DS from 'ember-data';

module.exports = DS.Model.extend({
    code: DS.attr('string'),
    input: DS.attr('string'),
    times: DS.attr('number'),
    exp: DS.attr('number'),
    order: DS.attr('number'),
    complete: DS.attr('boolean'),
    completed: DS.attr('number'),
    report:DS.attr(),
    challenge: DS.belongsTo('challenge'),
    user: DS.belongsTo('user'),
    arena: DS.belongsTo('arena'),
    arenaTrial: DS.belongsTo('arenaTrial'),

    canSubmit: function () {
        return !this.get('complete') || this.get('isDirty');
    }.property('complete', 'isDirty'),
});

export default undefined;
