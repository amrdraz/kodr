var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'bing91',
        pass: '56253861_gm'
    }
});

var smtpTransporter = nodemailer.createTransport(smtpTransport({
    host: 'smtp.webfaction.com',
    secure:true,
    port: 465,
    auth: {
        user: 'kodr',
        pass: 'belazy4ever'
    }
}));
var from = 'Owel <kodr@abkar.org>';

module.exports = function (options, cb) {
    // setup e-mail data with unicode symbols
    var mailOptions = options || {
        subject: 'Hello There', // Subject line
        html: '<p>Just Saying hi, why don\'t you check out some challanges</p>' // html body
    };

    mailOptions.from = mailOptions.from || from;

    // send mail with defined transport object
    smtpTransporter.sendMail(mailOptions, cb);
};