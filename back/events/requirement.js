var Promise = require('bluebird');
var _ = require('lodash');
var util = require('util');
var observer = require('../observer');
var ExpiringToken = require('../models/expiringToken');
var mail = require('../config/mail');

exports.model = function (Requirement) {

// when any or a specific challenge is complete
observer.on('trial.award', function(trial) {
    Promise.fulfilled().then(function() {
        return Requirement.find({
            model1: 'Challenge',
            $or: [{
                id1: {
                    $exists: false
                }
            }, {
                id1: trial.challenge
            }],
            complete: false,
            user: trial.user
        }).exec();
    }).then(function (reqs) {
        return _.map(reqs, function (req) {
            req.completed+=1;
            if(req.completed===req.times) {
                req.complete = true;
            }
            return new Promise(function(resolve, reject) {
                req.save(function(err, model) {
                    if (err) return reject(err);
                    if (model.complete) observer.emit('requirement.complete', req);
                    resolve(model);
                });
            });
        });
    });
});

// every time a challenge in a specific arena is complete
observer.on('arenaTrial.trial.awarded', function(arenaTrial) {
    Promise.fulfilled().then(function() {
        return Requirement.find({
            model1: 'Challenge',
            id1: {
                $exists: false
            },
            model2: 'Arena',
            id2: arenaTrial.arena,
            complete: false,
            user: arenaTrial.user
        }).exec();
    }).then(function(reqs) {
        return _.map(reqs, function(req) {
            req.completed = arenaTrial.completed;
            if (req.completed === req.times) {
                req.complete = true;
            }
            return new Promise(function(resolve, reject) {
                req.save(function(err, model) {
                    if (err) return reject(err);
                    if (model.complete) observer.emit('requirement.complete', req);
                    resolve(model);
                });
            });
        });
    });
});

// whenever any or a specific arena is complete
observer.on('arenaTrial.complete', function(arenaTrial) {
    Promise.fulfilled().then(function() {
        return Requirement.find({
            model1: 'Arena',
            $or: [{
                id1: {
                    $exists: false
                }
            }, {
                id1: arenaTrial.arena
            }],
            complete: false,
            user: arenaTrial.user
        }).exec();
    }).then(function (reqs) {
        return _.map(reqs, function (req) {
            req.completed+=1;
            if(req.completed===req.times) {
                req.complete = true;
            }
            return new Promise(function(resolve, reject) {
                req.save(function(err, model) {
                    if (err) return reject(err);
                    if (model.complete) observer.emit('requirement.complete', req);
                    resolve(model);
                });
            });
        });
    });
});

};