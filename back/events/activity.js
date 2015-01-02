var observer = require('../observer');
var util = require('util');
var Activity = require('../models/activity');
var Challenge = require('../models/challenge');
var User = require('../models/user');
var mail = require('../config/mail');

    
/**
 * Event listner for when a trial is complete
 * @param  {Trial} trial trial that was just complete for the first time
 * @return {[type]}       [description]
 */
observer.on('trial.award', function(trial) {
    // console.log('user award hook caought in user', trial.user);
    
});

observer.on('user.signup', function(user) {
    Activity.new({
        subject:user,
        action:'signup',
        verb:'signuped',
        object:user
    });
});

observer.on('user.login', function(user) {
    Activity.new({
        subject:user,
        action:'login',
        verb:'logedin',
        object:user
    });
});


observer.on('user.logout', function(user) {
    Activity.new({
        subject:user,
        action:'logout',
        verb:'logedout',
        object:user
    });
});


observer.on('user.connect', function(user) {
    User.setSocketId(user.user_id, user.socket_id);
    Activity.new({
        subjectId:user.user_id,
        subjectModel:'User',
        action:'connect',
        verb:'connected',
    }).then(function (act) {
        if (process.env.NODE_ENV==='test') {
            observer.emit('test.socket.respond', {sid:user.socket_id, event:'test.connect.response'});
        }
    });
});


observer.on('user.disconnect', function(id) {
    User.getUserBySocketId(id).then(function (user) {
        return Activity.new({
            subject:user,
            action:'disconnect',
            verb:'disconnected',
            object:user
        });
    }).then(function (act) {
        if (process.env.NODE_ENV==='test') {
            // observer.emit('test.socket.respond', {sid:id, event:'test.disconnect.response'});
        }
    });
});

observer.on('user.verified', function(user) {
    Activity.new({
        subject:user,
        action:'verify',
        verb:'verified',
        object:user
    });
});
