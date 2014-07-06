var attr = DS.attr;

module.exports = ChallengeModel = DS.Model.extend({
    name: attr('string'),
    setup: attr('string'),
    solution: attr('string'),
    tests: attr('string'),
    structure: attr('string'),
    callbacks: attr('string'),
    description: attr('string'),
    exp: attr('number'),
});

ChallengeModel.FIXTURES = [
    {
        id:1,
        name: 'Basic Test',
        setup: require('../demo/basicTest-setup'),
        solution: require('../demo/basicTest-solution'),
        tests: require('../demo/basicTest-tests'),
        structure: require('../demo/basicTest-structure'),
        callbacks: require('../demo/basicTest-callbacks'),
        description: require('../demo/basicTest-description'),
        exp: 10
    }
];
