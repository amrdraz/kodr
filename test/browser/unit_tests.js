moduleForModel('challenge', 'Challenge Model', {
    needs:['model:arena']
});

test('name property returns', function() {
    var person = this.subject({
                name: 'Basic Test',
                setup: "",
                solution: "var x = 20;",
                tests: "",
                preCode: "",
                postCode: "",
                description: "create a variable and assign to it the value 20",
                exp: 2,
                isPublished: false
            });
    var result = person.get('name');
    equal(result, 'Basic Test', "Name was " + result.name);
});

// test('fullName property updates when firstName is changed', function() {
//     var person = App.Person.create({firstName: 'toran', lastName: 'billups'});
//     var result = person.get('fullName');
//     equal(result, 'toran billups', "fullName was " + result);
//     person.set('firstName', 'wat');
//     result = person.get('fullName');
//     equal(result, 'wat billups', "fullName was " + result);
// });

// test('fullName property updates when lastName is changed', function() {
//     var person = App.Person.create({firstName: 'toran', lastName: 'billups'});
//     var result = person.get('fullName');
//     equal(result, 'toran billups', "fullName was " + result);
//     person.set('lastName', 'tbozz');
//     result = person.get('fullName');
//     equal(result, 'toran tbozz', "fullName was " + result);
// });
