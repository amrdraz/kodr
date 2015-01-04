var observer = require('../observer');
var util = require('util');
var Promise = require('bluebird');
var User = require('../models/user');
var mail = require('../config/mail');


observer.on('mail.quest.assign', function(usrs) {
    User.getByIds(usrs).then(function(users) {
        mail.openSMTPPool();
        Promise.each(users, function(user) {
            return mail.renderAndSend('questAssignment.html', user, {
                to: user.email,
                subject: "Quest Assignment",
                stub: process.env.NODE_ENV === 'test',
            });
        }).then(function (infos) {
            if(process.env.NODE_ENV==="test") {
                observer.emit('test.mail.quest.assignment', infos);
            }
            mail.closeSMTPPool();
        }).catch(function (err) {
            util.log(err); //log and fail silently
        });
    });
});
