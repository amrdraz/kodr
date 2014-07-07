module.exports = App.Trial = DS.Model.extend({
    code: DS.attr('string'),
    challenge: DS.belongsTo('challenge')
});
