// set up ======================================================================
// get all the tools we need
var express = require('express');
var app = express();
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
var swig = require('swig');

var config = require('./config/server.js')(process.env.NODE_ENV);

var port = config.port || process.env.PORT || 3000;
app.set('port', port);

app.use(morgan('dev')); // log every request to the console
app.use(cookiePraser('you cookie secret here')); // read cookies
app.use(bodyParser()); // get req.body from normal html form
// app.use(multer({dest: "./uploads"}));       // get req.files for miltipart/form-data
app.use(methodOverride());

var mongoose = require('mongoose');
mongoose.connect(config.db.url);
mongoose.connection.on('error', function() {
    console.log('← MongoDB Connection Error →');
});


//  Setting up template engine
app.engine('html', swig.renderFile);

app.set('view engine', 'html');
app.set('views', __dirname + '/views');

if (process.env.NODE_ENV === 'development') {

    // Swig will cache templates for you, but you can disable
    app.set('view cache', false);
    // To disable Swig's cache
    swig.setDefaults({
        cache: false
    });
}



// set up passport strategies
require('./config/passport.js')(passport);
// require for passport
if (process.env.NODE_ENV === 'production') {
    var MongoStore = require('connect-mongo')(session);
    app.use(session({
        secret: 'my secret sectret that no one knows about is prod',
        store: new MongoStore({
            mongoose_connection: mongoose.connections[0],
        })
    }));
} else {
    app.use(session({
        secret: 'my secret sectret that no one knows about is od'
    }));
}
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
if (process.env.NODE_ENV !== 'production') {
    app.use(express.static(path.join(__dirname, '../app')));
    app.use('/', express.static(path.join(__dirname, '../.tmp')));
} else {
    app.use(express.static(path.join(__dirname, '../dist')));
}

require('./routes')(app, passport);
require('./seed_db');

// require('./events')(app, passport);

module.exports = app;
