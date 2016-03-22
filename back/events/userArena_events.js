var Promise = require('bluebird');
var observer = require('../observer');
var util = require('util');
var mongoose = require('mongoose');

exports.sockets = function(io) {

};

exports.model = function(UserArena) {
    var Arena = mongoose.model('Arena');
    
    var queue = Promise.fulfilled();
    var timeout;
    observer.on('trial.award', function(trial) {
        if (trial.userArena)
            queue = queue.then(function(model) {
                return UserArena.findOneAndUpdate({
                    _id: trial.userArena,
                }, {
                    $inc: {
                        completed: 1,
                        exp: trial.exp
                    }
                }, {
                    new:true,
                    unset: true
                }).exec().then(function(userArena) {

                    if (userArena.trials.length === userArena.completed) {
                        // TODO: Check for userArenas which have this userArena as a prerequisit.
                        // Unlock these userArenas
                        return new Promise(function(resolve, reject) {
                            console.log("UNLOCKING USER ARENAS")
                            UserArena.update({
                                user: userArena.user,
                                prerequisit: userArena.arena
                            }, {locked: false}, {multi: true}, function(err, model){
                                if (err)
                                    console.log("Error updating User Arena at userArena_events.js", err);
                                resolve(model);
                            }).exec()
                        });
                        

                        ///////////////////////////////////////////////////////////
                        userArena.complete = true;
                        userArena.completeTime = Date.now();
                        return new Promise(function(resolve, reject) {
                            userArena.save(function(err, model) {
                                if (err) return reject(err);
                                if (model.complete) {
                                    observer.emit('userArena.complete', model);
                                }
                                observer.emit('userArena.trial.awarded', model);
                                resolve(model);
                            });
                        });
                    }
                    observer.emit('userArena.trial.awarded', userArena);
                    return userArena;
                });
            });
    });

};
