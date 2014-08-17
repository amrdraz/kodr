var attr = DS.attr;

var ArenaTrialModel = module.exports = DS.Model.extend({
    exp: attr('number'),
    user:DS.belongsTo('user', {async:true, inverse: 'arenasTried'}),
    challenges: DS.hasMany('challenge', {async: true, inverse: 'arena'}),
});

