var attr = DS.attr;
module.exports = DS.Model.extend({
    uname: attr('string'),
    gname: attr('string'),
    status: attr('string'),
    role: attr('string'),
    isActive: attr('boolean'),
    exp: attr('number'),
    user: DS.belongsTo('user', {
        async: true,
        inverse: 'memberships'
    }),
    group: DS.belongsTo('group', {
        async: true,
        inverse: 'members'
    }),

    roles:['subscriber','leader', 'owner'],

    isSubscriber:function () {
        return this.get('role')==='subscriber';
    },
    isLeader:function () {
        return this.get('role')==='subscriber';
    }
});
