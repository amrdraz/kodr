var Promise = require('bluebird');
var _ = require('lodash');
var observer = require('../observer');
var javaRunner = require('java-code-runner');

var Arena = require('../models/arena');

module.exports = function(schema, options) {
    var Model = options.model || options;
    schema.plugin(require('./_common_helper'), options);

    schema.methods.run = function(code) {
        var VChallenge = this.db.model('VChallenge');
        return VChallenge.run(code, this);
    };

    schema.statics.run = function(code, options) {
        return new Promise(function(resolve, reject) {
            switch (options.language) {
                case 'javascript':
                    resolve(['no server js', '']);
                    break;
                case 'java':
                    javaRunner.run(code, options, function(err, stout, sterr) {
                        if (err && !sterr) return reject(err);
                        return resolve([sterr, stout]);
                    });
                    break;
                case 'python':
                    break;
                case 'ruby':
                    break;
            }
        });
    };


    schema.methods.test = function(code) {
        var VChallenge = this.db.model('VChallenge');
        return VChallenge.test(code, this);
    };

    schema.statics.test = function(code, vchallenge) {
        return new Promise(function(resolve, reject) {
            switch (vchallenge.language) {
                case 'javascript':
                    resolve({}, ['no server js', '']);
                    break;
                case 'java':
                    javaRunner.test(code, vchallenge.tests, vchallenge, function(err, report, stout, sterr) {
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

    schema.statics.KCreate = function(vchallenge) {
        var VChallenge = this.db.model('VChallenge');
        var promise = Promise.fulfilled();

        if (!vchallenge.order && vchallenge.arena) {
            promise = promise.then(function() {
                return Arena.getById(vchallenge.arena).then(function(arena) {
                    vchallenge.order = arena.vchallenges.length + 1;
                });
            });
        }

        return promise.then(function() {
            return VChallenge.create(vchallenge);
        });
    };
};
