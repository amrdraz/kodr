module('integration tests', {
    setup: function() {
        Ember.run(function() {
            App.reset();
            // App.Challenge.challenges = [];
        });
    },
    teardown: function() {
        $.mockjaxClear();
    }
});

test('empty ajax response will yield empty table', function() {
    // stubEndpointForHttpRequest('/api/challenges', {challenge:[]});
    visit("/challenges");
    andThen(function() {
        var rows = find("ul.list-group li").length;
        equal(rows, 0, rows);
    });
});

test('create challenge while sign out', function() {
    stubEndpointForHttpRequest('/api/challenges', {challenge:[]});
    visit("/challenges");
    andThen(function() {
        equal(find('challenge-create').length, 0, 'found create btn');
    });
});


// test('ajax response with 2 people yields table with 2 rows', function() {
//     var json = {challenge:[{name: "basic"}, {name: "otherchallenge"}]};
//     // stubEndpointForHttpRequest('/api/challenges', json);
//     visit("/challenges");
//     andThen(function() {
//         var rows = find("ul.list-group li").length;
//         equal(rows, 2, rows);
//     });
// });

// test('another empty ajax response will yield another empty table', function() {
//     // stubEndpointForHttpRequest('/api/people', []);
//     visit("/challenges");
//     andThen(function() {
//         var rows = find("ul.list-group li").length;
//         equal(rows, 0, rows);
//     });
// });

// test('add will append another person to the html table', function() {
//     expect(4);
//     var matt = {
//                 name: 'Basic Test',
//                 setup: "",
//                 solution: "var x = 20;",
//                 tests: "",
//                 preCode: "",
//                 postCode: "",
//                 description: "create a variable and assign to it the value 20",
//                 exp: 2,
//                 isPublished: false
//             };
//     stubEndpointForHttpRequest('/api/challenges', {challenge:[matt]});
//     visit("/");
//     andThen(function() {
//       var rows = find("ul.list-group li").length;
//       equal(rows, 1, "there are " + rows + " rows");
//       var fullName = find("table tr:eq(0) td:eq(0)").text();
//       equal(fullName, "matt morrison", "the first table row had fullName: " + fullName);
//       fillIn(".firstName", "dustin");
//       fillIn(".lastName", "thostenson");
//       return click(".submit");
//     });
//     andThen(function() {
//       equal(find("table tr").length, 2, "the table of people was not complete");
//       equal(find("table tr:eq(1) td:eq(0)").text(), "dustin thostenson", "dustin was not added to the html table");
//   });
// });

// test('delete will remove the person for a given row', function() {
//     expect(5);
//     var matt = {firstName: 'matt', lastName: 'morrison'};
//     var toran = {firstName: 'toran', lastName: 'billups'};
//     stubEndpointForHttpRequest('/api/people', [matt, toran]);
//     visit("/");
//     andThen(function() {
//         var rows = find("table tr").length
//         equal(rows, 2, "the table had " + rows + " rows");
//         equal(find("table tr:eq(0) td:eq(0)").text(), "matt morrison", "the first row was incorrect");
//         equal(find("table tr:eq(1) td:eq(0)").text(), "toran billups", "the first row was incorrect");
//         return click("table .delete:first");
//     });
//     andThen(function() {
//         equal(find("table tr").length, 1, "the table of people was not complete");
//         equal(find("table tr:eq(0) td:eq(0)").text(), "toran billups", "the wrong person was deleted");
//     });
// });
