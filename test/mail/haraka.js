var mail = require('../../back/config/mail');
var should = require('chai').should();
var expect = require('chai').expect;


describe('Sending Email', function () {
    it('should send email', function (done) {
        mail.send({to:'amr.m.draz@gmail.com'}, function (err, info) {
            if (err) done(err);
            console.log(info);
            done();
        });
    });
});