var fs = require('fs');
module.exports = {
    host:'localhost:3000',
    db: {
        url:'localhost/kodr_tests'
    },
    mail: {
        host: 'localhost',
        secure: false,
        port: 2525,
        auth: {
            user: 'draz',
            pass: 'test'
        },
        maxConnections: 5,
        maxMessages: 10
    },
    admin: {
        email: 'amr.m.draz@gmail.com'
    },
    // ssl: {
    //     key: fs.readFileSync(__dirname+'/local.pem'),
    //     cert: fs.readFileSync(__dirname+'/local-cert.pem')
    // },
    redis: { host: 'localhost', port: 6379 },
    cookieSecret: 'this is a secret',
    sessionSecret: 'I don\'t know what\'s happening let\'s just see how this goes',
    port: 3000
};