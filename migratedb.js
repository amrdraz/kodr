var _ = require('lodash');
var Promise = require('bluebird');

process.env.NODE_ENV = 'development';
var config = require('./back/config/server.js');
var mongoose = require('mongoose');
mongoose.set('Promise', require('bluebird'));
mongoose.connection.on('error',function() {
    console.log('← MongoDB Connection Error →');
});
console.log("connecting too", config.db.url);
mongoose.connect(config.db.url);

var User = require('./back/models/user');

console.log('script running');

User.find({labGroup: null, 'flags.beta': {$exists: false}}).exec().then(function (users) {
    console.log('find users', users.length);
    return Promise.all(users.map(function (user) {
        console.log(user.username, user.flags);
        var flags = user.get('flags') || {};
        flags.beta = true;
        if(!flags.TA) {
            flags.jta = true;
        }
        user.set('flags', flags);
        user.markModified('flags');
        return new Promise(function (res, rej) {
            user.save(function (err, user) {
                console.log("after save", user.username, user.flags);
                if(err) return rej(err);
                res(user);
            });
        });
    }));
}).then(function () {
    console.log('done');
}, function (err) {
    console.log(err);
});