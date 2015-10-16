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

User.find({}).exec().then(function (users) {
    return Promise.all(users.map(function (user) {
        var flags = user.get('flags') || {};
        flags.csen = true;
        if(!flags.TA) {
            flags.csis = true;
        }
        user.set('flags', flags);
        user.markModified('flags');
        return new Promise(function (res, rej) {
            user.save(function (err, user) {
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