module.exports = App.Trial = DS.Model.extend({
    code: DS.attr('string'),
    times: DS.attr('number'),
    complete: DS.attr('boolean'),
    report:DS.attr(),
    challenge: DS.belongsTo('challenge'),
    user: DS.belongsTo('user'),
    arenaTrial: DS.belongsTo('arenaTrial'),

    canSubmit: function () {
        return !this.get('complete') || this.get('isDirty');
    }.property('complete', 'isDirty')
});
