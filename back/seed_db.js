var Promise = require('bluebird');
var mongoose = require('mongoose');
var User = require('./models/user');
var Group = require('./models/group');
var Arena = require('./models/arena');
var ArenaTrial = require('./models/arenaTrial');
var Challenge = require('./models/challenge');
var Trial = require('./models/trial');
var Activity = require('./models/activity');
var Achievement = require('./models/achievement');
var none = function () {};
var clearDB = function clearDB() {
    for (var i in mongoose.connection.collections) {
        mongoose.connection.collections[i].remove(none);
    }
    return 1;
};

var teacher,student,student2,student3,arena,challenge;
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
                name:'Variables'
            }),
            Group.create({
                founder:t._id,
                members:[student._id]
            })
        ];
    }).spread(function(a, student, student2, student3, admin) {
        return [
            Challenge.create({
                author: teacher._id,
                name:'Define x',
                exp:1,
                solution:'var x = 3;',
                setup:'',
                tests:'describe(function () {it("should define x", function () {expect(x).toBeDefined();});it("should define x", function () {expect(x).toEqual(3);});});'
            }),
            Challenge.create({
                author: teacher._id,
                name:'Define y',
                exp:1,
                solution:'var y = 3;',
                setup:'',
                tests:'describe(function () {it("should define y", function () {expect(y).toBeDefined();});it("should define y", function () {expect(y).toEqual(3);});});'
            }),
        ];
    }).then(function function_name (argument) {
        res.send('All Seeded');
    }).catch(function(err) {
        console.log(err);
    });
};
