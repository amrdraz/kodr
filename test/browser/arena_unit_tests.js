var env;
moduleForModel('arena', 'Arena Model', {
    needs: ['model:challenge']
});

test('name property is set', function() {
    var arena = this.subject({
        name: 'Basic Arena',
        description: "It is here you will face your first enemies",
    });
    var result = arena.get('name');
    equal(result, 'Basic Arena', "Name was " + result.name);
});


// test('arena relationships', function() {
//     var relationships = Ember.get(App.Arena, 'relationships');
//     deepEqual(relationships.get(App.Challenge), [{
//         name: 'challenges',
//         kind: 'hasMany'
//     }]);
// });
