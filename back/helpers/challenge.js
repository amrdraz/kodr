var Promise = require('bluebird');
var _ = require('lodash');
var observer = require('../observer');
var javaRunner = require('java-code-runner');

module.exports = function (schema, options) {
    var Model = options.model || options;
    schema.plugin(require('./_common_helper'), options);


    schema.methods.run = function(code) {
        var Challenge = this.db.model('Challenge');
        return Challenge.run(code, this);
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
        var Challenge = this.db.model('Challenge');
        return Challenge.test(code, this);
    };

    schema.statics.test = function(code, challenge) {
        return new Promise(function(resolve, reject) {
            switch (challenge.language) {
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
};
