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
        action:'signedup',
        object:null
    });
});


observer.on('user.verified', function(user) {
    Activity.new({
        subject:user,
        action:'verified',
        object:null
    });
});
