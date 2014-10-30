var Promise = require('bluebird');
var mongoose = require('mongoose');
var User = require('./models/user');
var Group = require('./models/group');
var Quest = require('./models/quest');
var Arena = require('./models/arena');
var ArenaTrial = require('./models/arenaTrial');
var Challenge = require('./models/challenge');
var Trial = require('./models/trial');
var Activity = require('./models/activity');
var Achievement = require('./models/achievement');
var none = function() {};
var clearDB = function clearDB() {
    for (var i in mongoose.connection.collections) {
        mongoose.connection.collections[i].remove(none);
    }
    return 1;
};

var teacher, student, student2, student3, arena, challenge;
module.exports = function(req, res, next) {
    Promise.fulfilled().then(function() {
        return clearDB();
    }).then(function() {
        return [
            User.create({
                username: 'teacher',
                email: 'teach@place.com',
                password: 'teacher123',
                role: 'teacher',
                activated: true
            }), User.create({
                username: 'student',
                email: 'student@place.com',
                password: 'student123',
                role: 'student',
                activated: true
            }), User.create({
                username: 'student2',
                email: 'student2@place.com',
                password: 'student123',
                role: 'student',
                activated: true
            }), User.create({
                username: 'student3',
                email: 'student3@place.com',
                password: 'student123',
                role: 'student',
                activated: true
            }), User.create({
                username: 'admin',
                email: 'admin@place.com',
                password: 'admin12345',
                role: 'admin',
                activated: true
            }),
        ];
    }).spread(function(t, st, st2, st3, ad) {
        teacher = t;
        student = st;
        student2 = st2;
        student3 = st3;

        return [
            Arena.create({
                author: t._id,
                name: 'Variables',
                isPublished:true,
                description:'Try out some variable exercises'
            }),
            Group.create({
                founder: t._id,
                members: [student._id]
            })
        ];
    }).spread(function(a, student, student2, student3, admin) {
        arena = a;
        return [
            Challenge.create({
                arena: a.id,
                author: teacher._id,
                name: 'Define x',
                language:'java',
                description: 'Define `int` __x__ with value equal to 3',
                exp: 10,
                valid:true,
                isPublished:false,
                solution: 'int x = 3;',
                setup: '',
                tests: 'if(x==3) {\n  Test.pass("You did it you\'re awesome", 10);\n} else {\n  Test.fail("The value of x should not be "+x);\n}'
            }),
            Challenge.create({
                arena: a.id,
                author: teacher._id,
                name: 'Say Hello',
                language:'java',
                description: 'Print `"Hello"`',
                exp: 10,
                valid:true,
                isPublished:true,
                solution: 'System.out.print("Hello");',
                setup: '// System.out.print();',
                tests: 'Test.expect($userOut.toString(),"Hello", "You did it you\'re awesome!", 10);'
            }),
            Challenge.create({
                arena: a.id,
                author: teacher._id,
                name: 'Get the 4th',
                language:'java',
                description: 'Print the __4th__ element of the array`',
                exp: 10,
                valid:true,
                isPublished:true,
                solution: 'int[] x = {12,43,56,344,56};\nSystem.out.print(x[3]);',
                setup: 'int[] x = {12,43,56,344,56};',
                tests: 'Test.expect($userOut.toString(),""+x[3], "You did it you\'re awesome!", 10);'
            }),
        ];
    }).spread(function(ch) {
        return [
            Quest.create({
                name: 'lab 1',
                rp: 10,
                requirements: [{
                    model1: 'Challenge',
                    id1: ch.id,
                    model2: 'Arena',
                    id2: undefined,
                }, {
                    model1: 'Challenge',
                    id1: undefined,
                    times: 2,
                    model2: 'Arena',
                    id2: arena.id,
                }],
                author: teacher.id,
                isPublished:true,
            }),
            Quest.create({
                name: 'extra',
                rp: 5,
                requirements: [{
                    model1: 'Arena',
                    id1: arena.id,
                    times: 1
                }],
                author: teacher.id,
            })
        ];
    }).spread(function(q) {
        return q;
    }).then(function(q) {
        res.send('All Seeded');
    }).catch(function(err) {
        console.log(err);
        res.send(err);
    });
};
