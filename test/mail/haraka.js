var mail = require('../../back/config/mail');
var should = require('chai').should();
var expect = require('chai').expect;
var Promise = require('bluebird');

describe('Sending Email', function () {
    it('should send email', function (done) {
        mail.send({to:'amr.m.draz@gmail.com', html:"Hello there"}, function (err, info) {
            if (err) return done(err);
            console.log(info);
            done();
        });
    });

    it('should send batch of mails email', function (done) {
        mail.openSMTPPool();
        Promise.each(new Array(10),function (v, i) {
            return mail.send({to:'amr.m.draz@gmail.com', html:"Hello there "+i});
        }).then(function (infos) {
            console.log(infos);
            mail.closeSMTPPool();
            done();
        }).catch(function (err) {
            console.log(err);
            mail.closeSMTPPool();
            done(err);
        });
    });
});