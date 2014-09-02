App.setupForTesting();
App.injectTestHelpers();

// describe('Test', function() {
//     beforeEach(function() {
//         App.reset();
//     });

//     it('should work', function() {
//         visit('/arenas');
//         // andThen(function() {
//         //     var rows = find("ul.list-group li");
//         //     rows.should.exist;
//         // });
//     });
// });

module('integration tests', {
    setup: function() {
        Ember.run(function() {
            App.reset();
            // App.Challenge.challenges = [];
        });
    },
    // teardown: function() {
    //     $.mockjaxClear();
    // }
});

test('one should equal one', function() {
    // stubEndpointForHttpRequest('/api/arenas', {arena:[]});
    visit("/arenas");
    equal(1, 1, 'error: one did not equal one');
});