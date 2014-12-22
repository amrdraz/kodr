var attr = DS.attr;

App.JavaInputTransform = App.JavaInputTransform || DS.Transform.extend({
  deserialize: function(serialized) {
    return serialized.map(function  (req) {
        return Object.create({value:req});
    });
  },
  serialize: function(deserialized) {
    return deserialized.mapBy("value");
  }
});

var ChallengeModel = module.exports = DS.Model.extend({
    name: attr('string', {
        defaultValue: "New Challenge"
    }),
    "import": attr('string'),
    inputs: attr('javaInput'),
    setup: attr('string', {
        defaultValue: "// Starting Code leave blank if you want Student to start from scratch\n"
    }),
    solution: attr('string', {
        defaultValue: "// Challenge Solution goes here\n"
    }),
    tests: attr('string', {
        defaultValue: "// $userOut, $test.expect(), $test.pass(), $test.fail(), $main()"
    }),
    // structure: attr('string', {defaultValue:"// Challenge Code Structure\n"}),
    // callbacks: attr('string', {defaultValue:"// callbacks for structure variables if any\n{}"}),
    language: attr('string', {defaultValue:'java'}),
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
    valid: attr('boolean', {
        defaultValue: false
    }),
    arena: DS.belongsTo('arena', {
        async: true,
        inverse: 'challenges'
    }),
    author: DS.belongsTo('user', {
        async: true,
        inverse: 'challenges'
    }),

    exp: attr('number', {defaultValue:10}),
    expOptions: [{
        rank: "direct",
        points: 10
    }, {
        rank: "simple",
        points: 20
    }, {
        rank: "easy",
        points: 40
    }, {
        rank: "medium",
        points: 80
    }, {
        rank: "challenging",
        points: 160
    }, {
        rank: "hard",
        points: 320
    }],

    isJava: function () {
        return this.get('language')==='java';
    }.property('language'),
    isJS: function () {
        return this.get('language')==='javascript';
    }.property('language'),

    // relationshipChanged: false,
    canSave: function() {
        return !this.get('isSaving') && this.get('isDirty') || this.get('isNew');
    }.property('isDirty', 'isSaving', 'isNew'),
    canReset: function() {
        return !this.get('isSaving') && this.get('isDirty') && !this.get('isNew');
    }.property('isDirty', 'isSaving'),
    canPublish: function() {
        return !this.get('canSave') && !this.get('isPublished') && this.get('valid');
    }.property('canSave')
});
