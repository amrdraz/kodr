var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
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

var from = '"Coding Owl" <od@kodr.in>';

var stubTransport = nodemailer.createTransport(stubTransport());

exports.host = config.host;

exports.options = {
    email:'od@kodr.in'
};

/**
 * Sends an email using an html template
 * @param  {String}   template    name of template found in views/mail
 * @param  {Object}   context     object to pass to template
 * @param  {Object}   mailOptions options for mail
 * @param  {Function} cb          callback after mail is sent
 */
exports.renderAndSend = function(template, context, mailOptions, cb) {

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
                smtpTransporter.sendMail(mailOptions, cb);
            }
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
exports.send = function(mailOptions, cb) {

    mailOptions = mailOptions || {
        subject: 'Hello There', // Subject line
        html: '<p>Something went wrong</p>'
    };

    mailOptions.from = mailOptions.from || from;

    if (mailOptions.stub) {
        stubTransport.sendMail(mailOptions, cb);
    } else {
        smtpTransporter.sendMail(mailOptions, cb);
    }
};
