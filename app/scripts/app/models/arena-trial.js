var attr = DS.attr;

var ArenaTrialModel = module.exports = DS.Model.extend({
    exp: attr('number'),
    completed: attr('number'),
    user:DS.belongsTo('user', {async:true, inverse: 'arenasTried'}),
    arena:DS.belongsTo('arena', {async:true, inverse: 'users'}),
    trials: DS.hasMany('trials', {async: true, inverse: 'arenaTrial'}),
});

