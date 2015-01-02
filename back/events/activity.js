var observer = require('../observer');
var util = require('util');
var Activity = require('../models/activity');
var Challenge = require('../models/challenge');
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

observer.on('user.verified', function(user) {
    Activity.new({
        subject:user,
        action:'verify',
        verb:'verified',
        object:user
    });
});
