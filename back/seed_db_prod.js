var Promise = require('bluebird');
var mongoose = require('mongoose');
var passGen = require('random-password-generator');
var mail = require('./config/mail');
var User = require('./models/user');
var Group = require('./models/group');
var Quest = require('./models/quest');
var Arena = require('./models/arena');
var UserArena = require('./models/userArena');
var Challenge = require('./models/challenge');
var Trial = require('./models/trial');
var Activity = require('./models/activity');
var Achievement = require('./models/achievement');

var teacher, student, student2, student3, arena, challenge;
module.exports = function() {
    var pass = passGen.generate();
    Promise.fulfilled().then(function() {
        return User.findOne({email:mail.options.email}).exec();
    }).then(function(admin) {
        if(!admin) {
            return User.create({
                username: 'od.admin',
                email: mail.options.email,
                password: pass,
                role: 'admin',
                activated: true
            });
        }
    }).then(function(u) {
        if(u) {
            console.log('All Seeded '+pass+" ");
            mail.send({subject:'Admin was initialized', html:'password is '+pass, to:u.email}, function (err, info) {
                if(err) throw err;
                console.log('mail sent');
            });
        }
    }).catch(function(err) {
        console.log(err);
    });
};
