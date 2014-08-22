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

    /**
     * POST /token
     * Sign in using identification and password.
     * @param {string} username
     * @param {string} password
     */

    app.post('/token', function(req, res, next) {
        passport.authenticate('local-login', function(err, user) {
            if (err) return next(err);
            if (user) res.send({
                access_token: user.token,
                user_id: user._id
            });
            else res.send(403, 'Incorrect username or password.');
        })(req, res, next);
    });


    /**
     * POST /login
     * Sign in using username and password.
     * @param {string} username
     * @param {string} password
     */

    app.post('/login', function(req, res, next) {
        passport.authenticate('local-login', function(err, user) {
            if (err) return next(err);
            if (user) res.send({
                access_token: user.token,
                user_id: user._id
            });
            else res.send(403, 'Incorrect username or password.');
        })(req, res, next);
    });

    app.get('/profile', access.hasToken, function(req, res) {
        res.json(
            req.user
        );
    });

    app.post('/profile', access.hasToken, function(req, res) {
        req.user.set(req.body);
        var token = req.user.token;
        req.user.save(function(err, user) {
            res.json(user);
        });
    });

    // logout
    app.del('/logout', access.hasToken, function(req, res) {
        req.logout();
        res.send(200);
    });

    // logout
    app.get('/confirmAccount/:token', function(req, res, next) {
        ExpiringToken.getToken(req.params.token).then(function(token) {
            console.log(token);
            var confirmURL = req.headers.host + '/confirmAccount/' + req.params.token;
            res.render('mail/welcome.html', {
                confirmURL: confirmURL,
                token: token
            });
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
                if (user) throw new Error(400);

                var email = req.body.email,
                    role = 'guest';
                if (/^\S+\.\S+@guc\.edu\.eg$/.test(email)) {
                    role = 'teacher';
                } else if (/^\S+\.\S+@student\.guc\.edu\.eg$/.test(email)) {
                    role = 'student';
                }
                var usr = User.create({
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password,
                    role: role
                });
                return usr;
            })
            .then(function (user) {
                var token = ExpiringToken.create({
                    user: user._id,
                    'for': 'newaccount',
                });
                return [user, token];
            })
            .spread(function(user, token) {
                if (user.email === 'amrmdraz@gmail.com') {
                    var confirmURL = req.headers.host + '/confirmAccount/' + token._id;
                    // template in views/mail
                    mail.renderAndSend('welcome.html', {
                        confirmURL: confirmURL
                    }, {
                        to: user.email,
                        subject: 'You\'ve just signup for an awesome experience',
                    }, function(err, info) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Message sent: ' + info.response);
                        }
                        if (err) throw err;
                        return res.send({
                            token: token,
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
