var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var htmlToText = require('nodemailer-html-to-text').htmlToText;
var path = require('path');
var emailTemplates = require('swig-email-templates');
// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'bing91',
        pass: '56253861_gm'
    }
});

var options = {
    root: path.join(__dirname, "../views/mail"),
    // any other swig options allowed here
};

var smtpTransporter = nodemailer.createTransport(smtpTransport({
    host: 'smtp.webfaction.com',
    secure: true,
    port: 465,
    auth: {
        user: 'kodr',
        pass: 'belazy4ever'
    }
}));
smtpTransporter.use('compile',htmlToText());
var from = '"Coding Owel" <kodr@abkar.org>';

exports.renderAndSend = function(template, context, mailOptions, cb) {
    console.log('root', options.root);

    emailTemplates(options, function(err, render) {
        if(err) return cb(err);
        render(template, context, function(err, html, text) {
            if (err) return cb(err, html);
            console.log('html', html);

            mailOptions.subject =  mailOptions.subject || 'Hello There'; // Subject line
            mailOptions.html = html;
            mailOptions.from = mailOptions.from || from;

            // send mail with defined transport object
            smtpTransporter.sendMail(mailOptions, cb);
        });
    });
};

exports.send = function (mailOptions, cb) {

    mailOptions = mailOptions || {
        subject: 'Hello There', // Subject line
        html: '<p>Something went wrong</p>'
    };

    mailOptions.from = mailOptions.from || from;

    // send mail with defined transport object
    smtpTransporter.sendMail(mailOptions, cb);
};
