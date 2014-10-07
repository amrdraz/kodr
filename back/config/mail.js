var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var stubTransport = require('nodemailer-stub-transport');
// var htmlToText = require('nodemailer-html-to-text').htmlToText;
var path = require('path');
var emailTemplates = require('swig-email-templates');

var options = {
    root: path.join(__dirname, "../views/mail"),
    // any other swig options allowed here
};

// uses SMTP sending actual emails
var smtpTransporter = nodemailer.createTransport(smtpTransport({
    host: 'smtp.webfaction.com',
    secure: true,
    port: 465,
    auth: {
        user: 'kodr',
        pass: 'belazy4ever'
    }
}));
// smtpTransporter.use('compile', htmlToText());

var from = '"Coding Owl" <kodr@abkar.org>';

var stubTransport = nodemailer.createTransport(stubTransport());

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
