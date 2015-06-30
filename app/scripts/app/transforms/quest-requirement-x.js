import DS from 'ember-data';
import Requirement from '/kodr/requirement';

var QuestRequirementTransform = QuestRequirementTransform || DS.Transform.extend({
  deserialize: function(serialized) {
    return serialized.map(function  (req) {
        return Requirement.create(req);
    });
  },
  serialize: function(deserialized) {
    console.log('serializing', deserialized);
    return deserialized.map(function (req) {
        return req.serialize();
    });
  }
});
module.exports = DS.Model.extend({
    name: DS.attr('string'),
    description: DS.attr('string'),
    rp: DS.attr('number'),
    requirements: DS.attr('questRequirement'),
    complete:DS.attr('boolean'),
    hash:function () {
        return '#'+this.get('id');
    }.property('id'),
    quest: DS.belongsTo('Quest', {
        async: true,
        inverse: 'userQuests'
    }),
    user: DS.belongsTo('User', {
        async: true,
        inverse: 'userQuests'
    })
});

export default QuestRequirementTransform;
