var observer = require('../observer');
var util = require('util');
var ExpiringToken = require('../models/expiringToken');
var Challenge = require('../models/challenge');
var mail = require('../config/mail');

exports.sockets = function (io) {
     //server events
    observer.on('user.awarded', function(user, type, value) {
        io.sockets.connected.length > 0 && io.emit('notification', user, type, value);
    });
};

exports.model = function(User) {
    
/**
 * Event listner for when a trial is complete
 * @param  {Trial} trial trial that was just complete for the first time
 * @return {[type]}       [description]
 */
observer.on('trial.award', function(trial) {
    // console.log('user award hook caought in user', trial.user);
    User.findById(trial.user, function(err, user) {
        if (err) throw err;
        user.award('exp', trial.exp, trial);
    });
});

observer.on('user.signup', function(user) {
    ExpiringToken.toVerify(user).then(function(eToken) {
        var confirmURL = mail.host + '/verify/' + eToken._id;
        // template in views/mail
        return mail.renderAndSend('welcome.html', {
            confirmURL: confirmURL
        }, {
            to: user.email,
            subject: 'You\'ve just signup for an awesome experience',
            stub: process.env.NODE_ENV === 'test',
        }).then(function(info) {
            if (process.env.NODE_ENV === 'test') {
                observer.emit('test.user.signup.response',{
                    activation_token: eToken._id,
                    user: user,
                    info: info
                });
            }
        });
    }).catch(function(err) {
        throw err;
    });
});

/* until imap or pop server is configured
observer.on('user.signup', function(user) {
    mail.send({
        to: mail.options.email,
        subject: 'A New '+user.role+' just signed up',
        html: 'User:<br>'+JSON.stringify(user.toJSON()),
        stub: process.env.NODE_ENV === 'test',
    }, function(err, info) {
        if (process.env.NODE_ENV === 'test') {
            observer.emit('test.user.signup.notify.admin',{
                info: info,
                user_token: user.token
            });
        }
    });
});
//*/
};
