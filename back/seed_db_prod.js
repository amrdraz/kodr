var Promise = require('bluebird');
var mongoose = require('mongoose');
var passGen = require('random-password-generator');
var mail = require('./config/mail');
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
module.exports = function() {
    var pass = passGen.generate();
    Promise.fulfilled().then(function() {
        return User.findOne({email:'od@kodr.in'}).exec();
    }).then(function(admin) {
        if(!admin) {
            return User.create({
                username: 'od.admin',
                email: 'od@kodr.in',
                password: pass,
                role: 'admin',
                activated: true
            });
        }
    }).then(function(u) {
        if(u) {
            console.log('All Seeded');
            mail.send({subject:'Admin was initialized', html:'password is '+pass, to:'od@kodr.in'}, function (err, info) {
                if(err) throw err;
                console.log('mail sent');
            });
        }
    }).catch(function(err) {
        console.log(err);
    });
};
