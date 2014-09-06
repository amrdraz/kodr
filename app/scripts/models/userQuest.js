module.exports = DS.Model.extend({
    requirements: DS.attr(),
    met:DS.attr('number'),
    quest: DS.belongsTo('Quest', {
        async: true,
        inverse: 'userQuests'
    }),
    user: DS.belongsTo('User', {
        async: true,
        inverse: 'userQuests'
    })
});
