/*globals before,after,beforeEach,afterEach,describe,it */
var runner = require('../index.js');
var expect = require('chai').expect;
var Promise = require('bluebird');
var request = require('supertest');
var http = require('http');


describe('Java runner', function() {

    var url;
    var port;
    before(function(done) {
        runner.runServer(function(p) {
            port = p;
            url = 'http://localhost:' + p;
            console.log('sending request to ' + url);
            done();
        });
    });
    describe('Java Server', function() {
        it('should respond to get with 200', function(done) {
            request(url)
                .get("/")
                .expect(200)
                .end(done);
        });
        it('should respond to post with json', function(done) {
            request(url)
                .post("/")
                .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                .send({
                    name: 'Main',
                    code: 'public class Main {public static void main (String [] args) { System.out.print("Hello World");}}'
                })
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body.stout).to.equal('Hello World');
                    done();
                });
        });

        it('should run multiple simple java prgrams concurently', function(done) {
            this.timeout(20000);
            Promise.map(new Array(10), function(x, i) {
                return new Promise(function(resolve, reject) {
                    // setTimeout(function() {
                    request(url)
                        .post("/")
                        .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                        .send({
                            name: 'Main' + i,
                            code: 'public class Main' + i + ' {public static void main (String [] args) { System.out.print("Hello World' + i + '");}}'
                        })
                        .end(function(err, res) {
                            if (err) return reject(err);
                            console.log(res.body.stout);
                            expect(res.body.stout).to.equal('Hello World' + i);
                            resolve(true);
                        });
                    // }, i * 40); //simulate trafic
                });
            }).then(function() {
                done();
            }).catch(done);
        });

        it('should respond to post using Test.java', function(done) {
            request(url)
                .post("/")
                .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                .send({
                    name: 'MainTest',
                    code: 'public class MainTest {public static void main (String [] args) { System.out.print("Hello World"); Test.pass("you did it!");}}'
                })
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body.stout).to.contain('<[TestOut]>');
                    done();
                });
        });
    });

    describe('index#run', function() {
        it('should run java', function(done) {
            runner.run('System.out.print("Hello");', function(err, stout, sterr) {
                stout && console.log(stout);
                sterr && console.error(sterr);
                if (err) return done(err);
                expect(stout).to.equal('Hello');
                done();
            });
        });

        it('should output sterr java', function(done) {
            runner.run('System.out.print("Hello")', function(err, stout, sterr) {
                stout && console.log(stout);
                sterr && console.error(sterr);
                expect(sterr).to.exist;
                done();
            });
        });

        it('should run multiple simple java prgrams', function(done) {
            this.timeout(20000);
            Promise.map(new Array(40), function(x, i) {
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        var start = new Date().getTime();
                        runner.run('System.out.print("Hello");System.out.print("World");', {
                            debug_number: i
                        }, function(err, stout, sterr) {
                            if (err) {
                                console.error(err + '\n==========================\n');
                                reject(err);
                            }
                            sterr && console.error(sterr);
                            expect(stout).to.equal('HelloWorld');
                            var end = new Date().getTime();
                            var time = end - start;
                            console.log('ran in ' + time + 'ms');
                            resolve();
                        });
                    }, i * 40); //simulate trafic
                });
            }).then(function() {
                done();
            }).catch(done);
        });

        it('shoudl run source code I submit but will fail because it will run last Main.java', function(done) {
            runner.run('System.out.print("Hello there ");System.out.print("World");', function(err, stout, sterr) {
                if (err) {
                    console.error(err + '\n==========================\n');
                    reject(err);
                }
                stout && console.log(stout);
                sterr && console.error(sterr);
                expect(stout).to.equal("Hello there World");
                done();
            });
        });

        it('shoudl Run correctly because I changed class name', function(done) {
            runner.run('System.out.print("Hello there ");System.out.print("World");', {
                name: 'Main2'
            }, function(err, stout, sterr) {
                if (err) {
                    console.error(err + '\n==========================\n');
                    reject(err);
                }
                stout && console.log(stout);
                sterr && console.error(sterr);
                expect(stout).to.equal("Hello there World");
                done();
            });
        });

        it('shoudl now not run correctly because I am calling a different program with that name', function(done) {
            runner.run('System.out.print("Hello there");', {
                name: 'Main2'
            }, function(err, stout, sterr) {
                if (err) {
                    console.error(err + '\n==========================\n');
                    reject(err);
                }
                stout && console.log(stout);
                sterr && console.error(sterr);
                expect(stout).to.equal("Hello there");
                done();
            });
        });
    });

    describe('index#test', function() {
        var code = 'char c =\'a\'; int a = 40, b = 20; System.out.print("a - b = " + (a - b));';
        var test = 'Test.expect($userOut.toString(),"a - b = 20");';

        it('should run code against test', function(done) {
            runner.test(code, test, {
                name: 'TestMain',
                exp: 1
            }, function(err, report, stout, sterr) {
                if (err) {
                    return done(err);
                }
                expect(report.passed).to.be.true;
                done();
            });
        });

        it('should run multiple tests concurently', function(done) {
            this.timeout(20000);
            Promise.map(new Array(10), function(x, i) {
                return new Promise(function(resolve, reject) {
                    // setTimeout(function() {
                    runner.test(code, test, {
                        name: 'TestMain',
                        exp: 1
                    }, function(err, report, stout, sterr) {
                        if (err) {
                            return reject(err);
                        }
                        expect(report.passed).to.be.true;
                        resolve();
                    });
                    // }, i * 40); //simulate trafic
                });
            }).then(function() {
                done();
            }).catch(done);
        });

        it('should timout if more then timelimit', function(done) {
            runner.run('long i = 100000000; while(i>0){if(i==30000){i+=3000;}i--;} System.out.print(i);', {
                timeLimit: 800
            }, function(err, stout, sterr) {
                if (err) {
                    console.error(err + '\n==========================\n');
                    return done(err);
                }
                stout && console.log(stout);
                expect(sterr).to.equal("TimeoutException: Your program ran for more than 800ms");
                done();
            });
        });
    });
});
