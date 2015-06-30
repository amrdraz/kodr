module.exports = DS.Model.extend({
    uniId: DS.attr('string'),
    username: DS.attr('string'),
    email: DS.attr('string'),
    exp: DS.attr('number', {defaultValue:0}),
    rp: DS.attr('number',{defaultValue:0}),
    role:DS.attr('string'),
    activated:DS.attr('boolean'),

    challenges: DS.hasMany('challenge', {async: true, inverse: 'author'}),
    arenas: DS.hasMany('arena', {async: true, inverse: 'author'}),
    
    trials: DS.hasMany('trial',{async: true, inverse: 'user'}),
    arenasTried: DS.hasMany('arenaTrial',{async: true, inverse: 'user'}),

    memberships: DS.hasMany('member',{async: true, inverse: 'user'}),

    userQuests: DS.hasMany('userQuest', {async:true,inverse:'user'}),

    roles:['student','teacher'],
    
    isStudent:function () {
        return this.get('role')==='student';
    }.property('role'),
    isTeacher:function () {
        return this.get('role')==='teacher';
    }.property('role'),
    isAdmin:function () {
        return this.get('role')==='admin';
    }.property('role'),
    canJoinGroups:function () {
        return !this.get('memberships.length') || !this.get('isStudent');
    }.property('memberships.@each','role')
});
