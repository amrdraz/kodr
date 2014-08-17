module.exports = App.Trial = DS.Model.extend({
    username: DS.attr('string'),
    exp: DS.attr('number'),
    rp: DS.attr('number'),
    role:DS.attr('string'),

    challenges: DS.hasMany('challenge', {async: true, inverse: 'author'}),
    arenas: DS.hasMany('arena', {async: true, inverse: 'author'}),
    
    trials: DS.hasMany('trial',{async: true, inverse: 'user'}),
    arenasTried: DS.hasMany('arenaTrial',{async: true, inverse: 'user'})
});
