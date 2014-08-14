// set up ======================================================================
// get all the tools we need
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var passport = require('passport');
var flash = require('connect-flash');
var EventEmitter = require('events').EventEmitter;

var morgan = require('morgan');
var cookiePraser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');

var session = require('express-session');
var methodOverride = require('method-override');

var path = require('path');
 
// Create Event Emiter
// require('util').inherits(global,require('events').EventEmitter);
GLOBAL.kodrEventManager = new EventEmitter();

// set up passport strategies
require('./config/passport.js')(passport);

app.use(morgan('dev')); // log every request to the console
app.use(cookiePraser('you cookie secret here')); // read cookies
app.use(bodyParser()); // get req.body from normal html form
// app.use(multer({dest: "./uploads"}));       // get req.files for miltipart/form-data
app.use(methodOverride());

// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.set('port', port);

// require for passport
app.use(session({
    secret: 'your session secret should go here'
}));
app.use(passport.initialize());
app.use(passport.session()); // presistent login sessions
app.use(flash()); // use conect flash to flash message stored in session

app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.send(500, {
        message: 'Internal Server Error'
    });
});
// app.use(sass.middleware({
//     src: path.join(__dirname, 'app')
// }));
app.use(express.static(path.join(__dirname, '../app')));
app.use('/',express.static(path.join(__dirname, '../.tmp')));

require('./routes')(app, passport);
require('./events')(app, passport);

module.exports = app;
