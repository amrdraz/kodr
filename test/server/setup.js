var Async = require('async');
var mongoose = require('mongoose');

var config = require('../../back/config/tests');
var Arena = require('../../back/models/arena');
var Challenge = require('../../back/models/challenge');

process.env.NODE_ENV = 'test';


before(function(done) {

    function clearDB() {
        for (var i in mongoose.connection.collections) {
            mongoose.connection.collections[i].remove(function() {});
        }
        return done();
    }

    if (mongoose.connection.readyState === 0) {
        mongoose.connect(config.db.url, function(err) {
            if (err) {
                throw err;
            }
            return clearDB();
        });
    } else {
        return clearDB();
    }
});

after(function(done) {
    mongoose.disconnect();
    return done();
});

module.exports = {
    clearDB: function(done) {
        for (var i in mongoose.connection.collections) {
            mongoose.connection.collections[i].remove(function() {});
        }
        return done();
    },
    challengeTest: function (done) {
      Async.parallel([
        function (cb) {
           Challenge.create({
                name: 'Basic Test',
                setup: "",
                solution: "var x = 20;",
                tests: "",
                preCode: "",
                postCode: "",
                description: "create a variable and assign to it the value 20",
                exp: 2,
                isPublished: false
            }, cb);
        },
        function (cb) {
           Challenge.create({
                name: 'Basic Test',
                setup: "",
                solution: "var x = 20;",
                tests: "",
                preCode: "",
                postCode: "",
                description: "create a variable and assign to it the value 20",
                exp: 4,
                isPublished: true
            }, cb);
        },
        function (cb) {
           Arena.create({
                name: 'Basic Arena',
                description: 'An arean for some challanges that are basic'
            }, cb);
        },

        ],function  (err, results) {
          if (err) done(err);
          results[2].get('challenges').push(results[1]);
          results[1].set('arena', results[2]._id);

          results[1].save(function (err) {
            if (err) done(err);
            results[2].save(done);
          });
        });
     
    }

};
