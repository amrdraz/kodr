var fs = require('fs');
module.exports = {
    host:'localhost:3000',
    db: {
        url:'localhost/tests'
    },
    mail: {
        host: '',
        secure: true,
        port: 465,
        auth: {
            user: '',
            pass: ''
        }
    },
    ssl: {
        key: fs.readFileSync(__dirname+'/local.pem'),
        cert: fs.readFileSync(__dirname+'/local-cert.pem')
    },
    redis: { host: 'localhost', port: 6379 },
    cookieSecret: 'this is a secret',
    sessionSecret: 'I don\'t know what\'s happening let\'s just see how this goes',
    port: 3000
};