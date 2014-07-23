module.exports = App.Trial = DS.Model.extend({
    code: DS.attr('string'),
    times: DS.attr('number'),
    completed: DS.attr('boolean'),
    report:DS.attr(),
    challenge: DS.belongsTo('challenge'),

    canSubmit: function () {
        return !this.get('completed') || this.get('isDirty');
    }.property('completed', 'isDirty')
});
