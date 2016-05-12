var Promise = require('bluebird');
var _ = require('lodash');
var config = require('../config/server.js');
var observer = require('../observer');
var javaRunner = require('java-code-runner');

var Arena = require('../models/arena');
var Concept = require('../models/concept');
var UserConcept = require('../models/userConcept');
var captainHook  = require('captain-hook');
var mongoose = require('mongoose');
 
 


module.exports = function(schema, options) {
    var Model = options.model || options;
    schema.plugin(require('./_common_helper'), options);
    schema.plugin(captainHook);

    // function to run after saving a new challenge instance

    schema.postCreate(function(challenge, next){
      var Concept = mongoose.model('Concept');
      _.map(challenge.concepts, function(cid) {
        Concept.findOne({
            _id: cid
        }).exec().then(function(concept) {
            var conChs = concept.challenges;
            conChs.push(challenge._id);
            Concept.update({
                _id: cid
            }, {
                challenges: conChs
            }).exec();
        });
      });
      next();
    });

    schema.methods.run = function(code) {
        var Challenge = this.db.model('Challenge');
        return Challenge.run(code, this);
    };

    schema.statics.run = function(code, options) {
        return new Promise(function(resolve, reject) {
            switch (options.type) {
                case 'javascript':
                    resolve(['no server js', '']);
                    break;
                case 'java':
                    if(!config.runJava) {
                        return resolve(['no server java', '']);
                    }
                    javaRunner.run(code, options, function(err, stout, sterr) {
                        if (err && !sterr) return reject(err);
                        return resolve([sterr, stout]);
                    });
                    break;
                case 'python':
                    return resolve(['no server java', '']);
                    break;
                case 'ruby':
                    return resolve(['no server java', '']);
                    break;
            }
        });
    };


    schema.methods.test = function(code) {
        var Challenge = this.db.model('Challenge');
        return Challenge.test(code, this);
    };

    schema.methods.hasFlag = function (flag) {
        return this.flags && this.flags[flag]!==undefined;
    };

    schema.methods.getFlag = function (flag) {
        return this.flags && this.flags[flag];
    };

    schema.methods.matchFlags = function (flags) {
        var aflags = this.flags;
        aflags = _.keys(aflags).filter(function(flag){return aflags[flag];});
        return _.every(aflags, function (flag) {
            return flags[flag];
        });
    };

    schema.statics.test = function(code, challenge) {
        return new Promise(function(resolve, reject) {
            switch (challenge.type) {
                case 'javascript':
                    resolve({}, ['no server js', '']);
                    break;
                case 'java':
                    javaRunner.test(code, challenge.tests, challenge, function(err, report, stout, sterr) {
                        if (err && !sterr) return reject(err);
                        return resolve([report, stout, sterr]);
                    });
                    break;
                case 'python':
                    break;
                case 'ruby':
                    break;
            }
        });
    };

    schema.statics.KCreate = function(challenge) {
        var Challenge = this.db.model('Challenge');
        var promise = Promise.fulfilled();

        if (!challenge.order && challenge.arena) {
            promise = promise.then(function() {
                return Arena.getById(challenge.arena).then(function(arena) {
                    challenge.order = arena.challenges.length + 1;
                });
            });
        }

        return promise.then(function() {
            return Challenge.create(challenge);
        });
    };

};
