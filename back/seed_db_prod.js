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

var teacher, student, student2, student3, arena, challenge;
module.exports = function(req, res, next) {
    Promise.fulfilled().then(function() {
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
                email: 'amr.m.draz@gmail.com',
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
                name: 'Variables'
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
                language:'java',
                name: 'Define x',
                description: 'Define a new `int` __x__ with value equal to 3',
                exp: 1,
                solution: 'int x = 3;',
                setup: '',
                tests: 'try {\n if(x===3) \n Test.pass(1); \n else \n Test.fail("x should wual 3");\n} catch (Exception e) {\n Test.fail("x was not deifnied");\n}'
            }),
            Challenge.create({
                arena: a.id,
                author: teacher._id,
                name: 'Define y',
                description: 'Define a new `var` __y__ with value equal to 3',
                exp: 1,
                solution: 'var y = 3;',
                setup: '',
                tests: 'describe("test",function () {it("should define y", function () {expect(y).toBeDefined();});it("should define y", function () {expect(y).toEqual(3);});});'
            }),
            Challenge.create({
                arena: a.id,
                author: teacher._id,
                name: 'Define z',
                description: 'Define a new `var` __z__ with value equal to 3',
                exp: 1,
                solution: 'var z = 3;',
                setup: '',
                tests: 'describe("test",function () {it("should define z", function () {expect(z).toBeDefined();});it("should define z", function () {expect(z).toEqual(3);});});'
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
