/*globals before,after,beforeEach,afterEach,describe,it */
var runner = require('../back/java-runner');
var expect = require('chai').expect;
var Promise = require('bluebird');

describe('Java runner', function() {
    it('should run java', function(done) {
        runner.run('System.out.print("Hello");', function(err, stout, sterr) {
            stout && console.log(stout);
            sterr && console.error(sterr);

            done();
        });
    });

    it('should output err java', function(done) {
        runner.run('System.out.print("Hello")', function(err, stout, sterr) {
            stout && console.log(stout);
            sterr && console.error(sterr);
            expect(sterr).to.exist;
            done();
        });
    });

    // it('should run multiple simple java prgrams', function(done) {
    //     this.timeout(20000);
    //     Promise.map(new Array(40), function(x, i) {
    //         return new Promise(function(resolve, reject) {
    //             setTimeout(function() {
    //                 var start = new Date().getTime();
    //                 runner.run('System.out.print("Hello");System.out.print("World");', function(err, stout, sterr) {
    //                     if (err) {
    //                         console.error(err + '\n==========================\n');
    //                         reject(err);
    //                     }
    //                     stout && console.log(stout);
    //                     sterr && console.error(sterr);
    //                     var end = new Date().getTime();
    //                     var time = end - start;
    //                     console.log('ran ' + time);
    //                     resolve();
    //                 });
    //             }, i * 100);
    //         });
    //     }).then(function() {
    //         done();
    //     }).catch(done);
    // });

    it('should run multiple heavy java prgrams', function(done) {
        this.timeout(20000);
        Promise.map(new Array(10), function(x, i) {
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    var start = new Date().getTime();
                    runner.run('long x = 1000000000; long i = 0; while(i<x){i++;}', function(err, stout, sterr) {
                        if (err) {
                            console.error(err + '\n==========================\n');
                            reject(err);
                        }
                        stout && console.log(stout);
                        sterr && console.error(sterr);
                        var end = new Date().getTime();
                        var time = end - start;
                        console.log('ran ' + time);
                        resolve();
                    });
                }, i * 100);
            });
        }).then(function() {
            done();
        }).catch(done);
    });
});
