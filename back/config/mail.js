var Promise = require('bluebird');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var smtpPoolTransport = require('nodemailer-smtp-pool');
var stubTransport = require('nodemailer-stub-transport');
// var htmlToText = require('nodemailer-html-to-text').htmlToText;
var path = require('path');
var emailTemplates = require('swig-email-templates');
var config = require('./server');
var options = {
    root: path.join(__dirname, "../views/mail"),
    // any other swig options allowed here
};

// uses SMTP sending actual emails
var smtpTransporter = nodemailer.createTransport(smtpTransport(config.mail));
// smtpTransporter.use('compile', htmlToText());
var smtpPool;
var smtpPoolOpend = 0;

var from = '"Coding Owl" <od@kodr.in>';

var stubTransport = nodemailer.createTransport(stubTransport());

exports.host = config.host;

exports.options = {
    email:'od@kodr.in'
};

var openSMTPPool = exports.openSMTPPool = function () {
    if (!smtpPoolOpend) {
        smtpPoolOpend++;
        smtpPool = nodemailer.createTransport(smtpPoolTransport(config.mail));
    }
};

var closeSMTPPool = exports.closeSMTPPool = function () {
    if (smtpPoolOpend>0) {
        smtpPoolOpend--; //this way it stays open even when closed if some other batch is called
        smtpPool.close();
    }
};


/**
 * sends an email taking 
 * @param  {Object}   mailOptions options for email
 *                                -subject email subject
 *                                -html content of mail in html
 *                                -from [optional] where email is sent from default is koding owl
 * @param  {Function} cb          call back retuning error or info about sent email
 */
var send = exports.send = function(mailOptions, cb) {

    mailOptions = mailOptions || {
        subject: 'Hello There', // Subject line
        html: '<p>Something went wrong</p>'
    };

    mailOptions.from = mailOptions.from || from;

    return new Promise(function (res, rej) {
        if (mailOptions.stub) {
            stubTransport.sendMail(mailOptions, function (err, info) {
                if (cb) return cb(err, info);
                if (err) return rej(err);
                res(info);
            });
        } else {
            (smtpPoolOpend?smtpPool:smtpTransporter).sendMail(mailOptions, function (err, info) {
                if (cb) return cb(err, info);
                if (err) return rej(err);
                res(info);
            });
        }
    });
};


/**
 * Sends an email using an html template
 * @param  {String}   template    name of template found in views/mail
 * @param  {Object}   context     object to pass to template
 * @param  {Object}   mailOptions options for mail
 * @param  {Function} cb          callback after mail is sent
 */
var renderAndSend = exports.renderAndSend =  function(template, context, mailOptions, cb) {
    return new Promise(function (res, rej) {
        emailTemplates(options, function(err, render) {
            if (err) return cb(err);
            render(template, context, function(err, html, text) {
                if (err) return cb(err, html);

                mailOptions.subject = mailOptions.subject || 'Hello There'; // Subject line
                mailOptions.html = html;
                mailOptions.text = text;
                mailOptions.from = mailOptions.from || from;

                res(send(mailOptions, cb));
            });
        });
    });
};
/**
 * sends an email taking 
 * @param  {Object}   mailOptions options for email
 *                                -subject email subject
 *                                -html content of mail in html
 *                                -from [optional] where email is sent from default is koding owl
 * @param  {Function} cb          call back retuning error or info about sent email
 */
var batchSend = exports.batchSend = function(tos, mailOptions, cb) {

    mailOptions = mailOptions || {
        subject: 'Hello There', // Subject line
        html: '<p>Something went wrong</p>'
    };

    mailOptions.from = mailOptions.from || from;

    if (mailOptions.stub) {
        Promise.map(tos, function (to) {
            return new Promise(function (res, rej) {
                mailOptions.to = to;
                stubTransport.sendMail(mailOptions, function (err, info) {
                    res({err:err, info:info});
                });
            });
        }).then(function (infos) {
            cb(infos);
        });
    } else {
        openSMTPPool();
        Promise.map(tos, function (to) {
            return new Promise(function (res, rej) {
                mailOptions.to = to;
                smtpPool.sendMail(mailOptions, function (err, info) {
                    res({err:err, info:info});
                });
            });
        }).then(function (infos) {
            closeSMTPPool();
            cb(arguments);
        });
    }
};


/**
 * Sends an email using an html template
 * @param  {String}   template    name of template found in views/mail
 * @param  {Object}   context     object to pass to template
 * @param  {Object}   mailOptions options for mail
 * @param  {Function} cb          callback after mail is sent
 */
exports.batchRenderAndSend = function(template, context, tos, mailOptions, cb) {

    emailTemplates(options, function(err, render) {
        if (err) return cb(err);
        render(template, context, function(err, html, text) {
            if (err) return cb(err, html);

            mailOptions.subject = mailOptions.subject || 'Hello There'; // Subject line
            mailOptions.html = html;
            mailOptions.text = text;
            mailOptions.from = mailOptions.from || from;

            if (mailOptions.stub) {
                stubTransport.sendMail(mailOptions, cb);
            } else {
                batchSend.sendMail(tos, mailOptions, cb);
            }
        });
    });
};

