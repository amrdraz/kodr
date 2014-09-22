var Promise = require('bluebird');
var User = require('./models/user');
var ExpiringToken = require('./models/expiringToken');
var access = require('./routes/access');
var Challenge = require('./models/challenge');
var mail = require('./config/mail');

module.exports = function(app, passport) {

    // challenge routes
    require('./routes/challenge')(app, passport);
    // trial routes
    require('./routes/trial')(app, passport);
    // arena routes
    require('./routes/arena')(app, passport);
    // arena trial routes
    require('./routes/arenaTrial')(app, passport);
    // user routes
    require('./routes/user')(app, passport);
    // group routes
    require('./routes/group')(app, passport);
    // quest routes
    require('./routes/quest')(app, passport);
    // userQuest routes
    require('./routes/userQuest')(app, passport);

    if(process.env.NODE_ENV!=='production') {
        app.get('/seed_db', require('./seed_db'));
    }

    /**
     * POST /token
     * Sign in using identification and password.
     * @param {string} username
     * @param {string} password
     */

    app.post('/token', function(req, res, next) {
        passport.authenticate('local-login', function(err, user) {
            if (err) return next(err);
            if (user) {
                if(!user.activated) return res.send(400, 'Please Confirm your email');

                res.send({
                    access_token: user.token,
                    user_id: user._id
                });
            }
            else res.send(403, 'Incorrect username or password.');
        })(req, res, next);
    });

    // logout
    app.del('/logout', access.hasToken, function(req, res) {
        req.logout();
        res.send(200);
    });

    // logout
    app.get('/confirmAccount/:token', function(req, res, next) {
        ExpiringToken.getToken(req.params.token).then(function(token) {
            User.findOne({_id:token.user}).exec().then(function (user) {
                user.activated = true;
                user.save();
                // var confirmURL = req.headers.host + '/confirmAccount/' + req.params.token;
                res.render('confirm.html', {
                    user:user
                });
            }, next);
        }, next);
    });

    /**
     * POST /signup
     * Create a new local account.
     * @param {string} username
     * @param {string} email
     * @param {string} password
     * @param {string} confirmPassword
     */

    app.post('/signup', function(req, res, next) {
        if (!req.body.username) {
            return res.send(400, 'Username cannot be blank.');
        }

        if (!req.body.email) {
            return res.send(400, 'Email cannot be blank.');
        }

        if (!req.body.password) {
            return res.send(400, 'Password cannot be blank.');
        }

        if (req.body.password !== req.body.passwordConfirmation) {
            return res.send(400, 'Passwords do not match.');
        }

        Promise.fulfilled()
            .then(function() {
                return User.findOne({
                    $or: [{
                        'username': req.body.username
                    }, {
                        'email': req.body.email,
                    }]
                }).exec();
            })
            .then(function(user) {
                if (user) throw new Error(400, 'User already defined');

                var email = req.body.email;
                var role = 'student';
                var activated = true;
                if (/^\S+\.\S+@guc\.edu\.eg$/.test(email)) {
                    role = 'teacher';
                    //TODO uncomment this in production
                    activated = false;
                } else if (/^\S+\.\S+@student\.guc\.edu\.eg$/.test(email)) {
                    role = 'student';
                }
                var usr = User.create({
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password,
                    role: role,
                    activated:activated
                });
                return usr;
            })
            .then(function (user) {
                var token;
                if(!user.activated)
                    token = ExpiringToken.create({
                        user: user._id,
                        'for': 'newaccount',
                    });
                return [user, token];
            })
            .spread(function(user, token) {
                if (!user.activated) {
                    var confirmURL = req.headers.host + '/confirmAccount/' + token._id;
                    // template in views/mail
                    return mail.renderAndSend('welcome.html', {
                        confirmURL: confirmURL
                    }, {
                        to: user.email,
                        subject: 'You\'ve just signup for an awesome experience',
                        stub: process.env.NODE_ENV==='test',
                    }, function(err, info) {
                        if (err) throw err;
                        return res.send({
                            token: token._id,
                            info: info
                        });
                    });
                }
                res.send(200);
            }).catch(function (err) {
                console.log(err);
                if(err.message===400) {
                    return res.send(400, 'User exists');
                }
                res.send(500, err.message);
            });
    });
};
