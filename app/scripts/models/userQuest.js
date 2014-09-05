module.exports = DS.Model.extend({
    requirements: DS.attr(),
    quest: DS.belongsTo('Quest', {
        async: true,
        inverse: 'users'
    }),
    user: DS.belongsTo('User', {
        async: true,
        inverse: 'quests'
    })
});
