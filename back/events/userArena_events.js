var Promise = require('bluebird');
var observer = require('../observer');
var util = require('util');

exports.sockets = function(io) {

};

exports.model = function(UserArena) {
    
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
