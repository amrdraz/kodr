module.exports = DS.Model.extend({
    username: DS.attr('string'),
    exp: DS.attr('number'),
    rp: DS.attr('number'),
    role:DS.attr('string'),

    challenges: DS.hasMany('challenge', {async: true, inverse: 'author'}),
    arenas: DS.hasMany('arena', {async: true, inverse: 'author'}),
    
    trials: DS.hasMany('trial',{async: true, inverse: 'user'}),
    arenasTried: DS.hasMany('arenaTrial',{async: true, inverse: 'user'}),

    groups: DS.hasMany('group',{async: true, inverse: 'founder'}),
    group: DS.belongsTo('group',{async: true, inverse: 'members'}),

    userQuests: DS.hasMany('userQuest', {async:true,inverse:'user'}),

    isStudent:function () {
        return this.get('role')==='student';
    }.property('role')
});
