var attr = DS.attr;

var ChallengeModel = module.exports = DS.Model.extend({
    name: attr('string', {
        defaultValue: "New Challenge"
    }),
    setup: attr('string', {
        defaultValue: "// Starting Code leave blank if you want Student to start from scrach\n"
    }),
    solution: attr('string', {
        defaultValue: "// Challenge Solution goes here\n"
    }),
    tests: attr('string', {
        defaultValue: "// Challenge Tests go here\n"
    }),
    // structure: attr('string', {defaultValue:"// Challenge Code Structure\n"}),
    // callbacks: attr('string', {defaultValue:"// callbacks for structure variables if any\n{}"}),
    preCode: attr('string'),
    postCode: attr('string'),
    description: attr('string', {
        defaultValue: "A new Challenge"
    }),
    status: attr('string', {
        defaultValue: "unPublished"
    }),
    statusOptions: ['unPublished', 'Beta', 'Published'],
    isPublished: attr('boolean', {
        defaultValue: false
    }),
    arena: DS.belongsTo('arena', {async: true, inverse: 'challenges'}),
    author:DS.belongsTo('user', {async:true, inverse:'challenges'}),

    exp: attr('number'),
    expOptions: [{
        rank: "direct",
        points: 1
    }, {
        rank: "simple",
        points: 2
    }, {
        rank: "easy",
        points: 4
    }, {
        rank: "medium",
        points: 8
    }, {
        rank: "challenging",
        points: 16
    }, {
        rank: "hard",
        points: 32
    }],

    relationshipChanged:false,

    canSave: function() {
        return this.get('isDirty') || this.get('isNew') || this.get('relationshipChanged');
    }.property('isDirty', 'relationshipChanged'),
    canReset: function() {
        return this.get('isDirty') && !this.get('isNew') && this.get('relationshipChanged');
    }.property('isDirty', 'relationshipChanged'),
    canPublish: function() {
        return !this.get('canSave') && !this.get('isPublished');
    }.property('canSave')
});

ChallengeModel.FIXTURES = [{
    id: 1,
    name: 'Basic Test',
    setup: require('../demo/basicTest-setup'),
    solution: require('../demo/basicTest-solution'),
    tests: require('../demo/basicTest-tests'),
    structure: require('../demo/basicTest-structure'),
    callbacks: require('../demo/basicTest-callbacks'),
    description: require('../demo/basicTest-description'),
    exp: 1,
    isPublished: true
}, {
    id: 2,
    name: 'Cow Challenge',
    setup: require('../demo/cow'),
    solution: require('../demo/cow'),
    tests: require('../demo/cow-test'),
    structure: "",
    callbacks: "",
    description: "",
    exp: 4,
    isPublished: true
}];
