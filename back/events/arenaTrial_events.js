var Promise = require('bluebird');
var observer = require('../observer');
var util = require('util');

exports.sockets = function(io) {

};

exports.model = function(ArenaTrial) {
    
    var queue = Promise.fulfilled();
    var timeout;
    observer.on('trial.award', function(trial) {
        if (trial.arenaTrial)
            queue = queue.then(function(model) {
                return ArenaTrial.findOneAndUpdate({
                    _id: trial.arenaTrial,
                }, {
                    $inc: {
                        completed: 1,
                        exp: trial.exp
                    }
                }, {
                    new:true,
                    unset: true
                }).exec().then(function(arenaTrial) {
                    if (arenaTrial.trials.length === arenaTrial.completed) {
                        arenaTrial.complete = true;
                        arenaTrial.completeTime = Date.now();
                        return new Promise(function(resolve, reject) {
                            arenaTrial.save(function(err, model) {
                                if (err) return reject(err);
                                if (model.complete) {
                                    observer.emit('arenaTrial.complete', model);
                                }
                                observer.emit('arenaTrial.trial.awarded', model);
                                resolve(model);
                            });
                        });
                    }
                    observer.emit('arenaTrial.trial.awarded', arenaTrial);
                    return arenaTrial;
                });
            });
    });

};
