var Promise = require('bluebird');
var User = require('./models/user');
var Group = require('./models/group');
var Arena = require('./models/arena');
var ArenaTrial = require('./models/arenaTrial');
var Challenge = require('./models/challenge');
var Trial = require('./models/trial');
var Activity = require('./models/activity');
var Achievement = require('./models/achievement');


Promise.fulfilled().then(function () {
    return User.findOne('teacher').exec();
}).then(function(user) {
    if(user) throw new Error('already seeded');
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
            username: 'admin',
            email: 'admin@place.com',
            password: 'admin12345',
            role: 'admin',
            activated: true
        }),

    ];
}).spread(function(teacher, student, student2, admin) {

}).catch(function (err) {
    console.log(err);
});
