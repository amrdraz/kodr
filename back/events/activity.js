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
observer.on('trial.complete', function(trial) {
    Activity.new({
        subjectId:trial.user,
        subjectModel:'User',
        action:'complete',
        verb:'completed',
        object:trial
    });
});

observer.on('arenaTrial.complete', function(arenaTrial) {
    Activity.new({
        subjectId:arenaTrial.user,
        subjectModel:'User',
        action:'complete',
        verb:'completed',
        object:arenaTrial
    });
});

observer.on('requirement.complete', function(req) {
    Activity.new({
        subjectId:req.user,
        subjectModel:'User',
        action:'complete',
        verb:'completed',
        object:req
    });
});
//TODO quest.finished for when timout before complete
observer.on('quest.complete', function(uq) {
    Activity.new({
        subjectId:uq.user,
        subjectModel:'User',
        action:'complete',
        verb:'completed',
        object:uq
    });
});

observer.on('quest.create', function(user,q) {
    Activity.new({
        subject:user,
        action:'create',
        verb:'created',
        object:q
    });
});


observer.on('quest.update', function(user,q) {
    Activity.new({
        subject:user,
        action:'update',
        verb:'updated',
        object:q
    });
});


observer.on('quest.delete',function(user,q) {
    Activity.new({
        subject:user,
        action:'delete',
        verb:'deleted',
        object:q
    });
});

// when a user joins a quest
observer.on('quest.join', function(uq) {
    Activity.new({
        subjectId:uq.user,
        subjectModel:'User',
        action:'join',
        verb:'joined',
        object:uq
    });
});

// when someon assigns users to a quest
observer.on('user.assign', function(user, quest,meta) {
    Activity.new({
        subject:user,
        subjectModel:'User',
        action:'assign',
        verb:'assigned',
        object:quest,
        objectMeta:meta
    });
});

observer.on('user.unassign', function(user, uquest) {
    Activity.new({
        subject:user,
        subjectModel:'User',
        action:'assign',
        verb:'assigned',
        object:uquest
    });
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
