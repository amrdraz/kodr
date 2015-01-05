// set up ======================================================================
// get all the tools we need
var config = require('./config/server.js');

var express = require('express');
var app = express();
// app.https(config.ssl).io();
// app.http().io();
var http = require('http').createServer(app);
var io = app.io = require('socket.io')(http);
var ioredis = require('socket.io-redis');
io.adapter(ioredis(config.redis));

var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var compress = require('compression');
var cookiePraser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var methodOverride = require('method-override');

var path = require('path');
var swig = require('swig');


var port = config.port || process.env.PORT || 3000;
app.set('port', port);

app.use(morgan(process.env.NODE_ENV=='production'?'[:date[clf]] ":method :remote-addr  :url HTTP/:http-version" :status :res[content-length] :req[Authorization] :response-time':'dev')); // log every request to the console
app.use(compress()); // log every request to the console
app.use(cookiePraser(config.cookieSecret)); // read cookies
app.use(bodyParser()); // get req.body from normal html form
// app.use(multer({dest: "./uploads"}));       // get req.files for miltipart/form-data
app.use(methodOverride());

var mongoose = require('mongoose');
var connectDB =  function() {
    mongoose.connect(config.db.url);
};
mongoose.connection.on('error',function() {
    console.log('← MongoDB Connection Error →');
    console.log('reconnedtin in 1 seccond');
    setTimeout(connectDB, 1000);
});
connectDB();

var runner = require('java-code-runner');
runner.server.recompile(function () {
    runner.server.startServer(function(p) {
        console.log('started java server at http://localhost:' + p);
    });
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
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
app.use(session({
    secret: config.sessionSecret,
     store: new RedisStore(config.redis),
}));
app.use(function (req, res, next) {
  if (!req.session) {
    return next(new Error('Lost connection to Redis')); // handle error
  }
  next(); // otherwise continue
});

app.use(passport.initialize());
app.use(passport.session()); // presistent login sessions
app.use(flash()); // use conect flash to flash message stored in session

app.use(function(err, req, res, next) {
    if(process.env.NODE_ENV==='test') {
        console.log(err.stack);
    } else {
        console.error(err.stack);        
    }
    if (err.http_code) {
        return res.send(err.http_code, err.message);
    }
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

/**
 * @on connection
 */
require('./events')(app.io);

if (process.env.NODE_ENV === 'production') {
    require('./seed_db_prod')();
}

http.listen(config.port, function() {
    console.log('Express server running https port ' + config.port);
});

// var httpApp = express();
// var http = require('http').createServer(httpApp);
// // set up a route to redirect http to https
// httpApp.get('*',function(req,res){  
//     res.redirect('https://'+config.host+req.url);
// });
// http.listen(config.port);

module.exports = app;
