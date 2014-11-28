/*globals before,beforeEach,after,afterEach,describe,it */
var mongoose = require('mongoose');
var expect = require('chai').expect;
var request = require('supertest-as-promised');
var util = require('util');
var Promise = require("bluebird");
var User = require('../../back/models/user');
var Challenge = require('../../back/models/challenge');
var Trial = require('../../back/models/trial');
var Arena = require('../../back/models/arena');
var ArenaTrial = require('../../back/models/arenaTrial');
var observer = require('../../back/observer');

var url = 'http://localhost:3000';
var api = url+"/api";
var none = function() {};
var clearDB = function clearDB(done) {
    for (var i in mongoose.connection.collections) {
        mongoose.connection.collections[i].remove(none);
    }
    return done();
};

var config = require('../../back/config/tests');

process.env.NODE_ENV = 'test';



before(function(done) {
    if (mongoose.connection.readyState === 0) {
        mongoose.connect(config.db.url, function(err) {
            if (err) {
                throw err;
            }
            return clearDB(done);
        });
    } else {
        return clearDB(done);
    }
});

after(function(done) {
    mongoose.disconnect();
    return done();
});

module.exports = {
    url:url,
    api:api,
    login: function (user) {
        var login = {
            username:user.username || user.email,
            password:user.password
        };
        // console.log(login);
        return new Promise(function (resolve, reject) {
            return request(url)
                .post("/token")
                .send(login)
                .then(function(res) {
                    // console.log(res.text);
                    expect(res.status).to.equal(200);
                    resolve(res.body);
                }, reject);
        });
    },
    clearDB: clearDB,
    challengeTest: function(done, db) {
        db = db || {};
        return Promise.fulfilled()
            .then(function() {
                var ar = Arena.create({});
                var teacher = User.create({
                    username: 'teachert',
                    email: 'tw.w@guc.edu.eg',
                    password: 'testsmodel1'
                });
                var student = User.create({
                    username: 'studentt',
                    email: 's.3@student.guc.edu.eg',
                    password: 'testsmodel1'
                });
                var student2 = User.create({
                    username: 'student2',
                    email: 's.2@student.guc.edu.eg',
                    password: 'testsmodel1'
                });
                return [ar, teacher, student, student2];
            })
            .spread(function(ar, usr, std, std2) {
                var arena = db.arena = ar;
                var user = db.user = db.teacher = usr;
                db.student = std;
                db.student2 = std2;
                var at = ArenaTrial.create({
                    arena: arena._id,
                    user: user._id
                });
                var ch = Challenge.create({
                    exp: 4,
                    arena: arena._id
                });
                var ch2 = Challenge.create({
                    exp: 2,
                    arena: arena._id
                });
                Challenge.create({
                    exp: 2,
                });
                return [at, ch, ch2];
            })
            .spread(function(at, ch1, ch2) {
                db.challenge = ch1;
                db.challenge2 = ch2;
                db.arenaTrial = at;
                return [at, ch1, ch2];
            })
            .spread(function(ch1, ch2) {
                var tr = Trial.create({
                    challenge: ch1._id,
                    user: db.user._id
                });
                var tr2 = Trial.create({
                    challenge: ch2._id,
                    user: db.user._id
                });
                db.trials = db.trials || [];
                return Promise.each([tr, tr2], function(tr) {
                    db.trials.push(tr);
                });
            })
            .finally(done);
    }

};
