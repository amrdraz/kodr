var Promise = require('bluebird');
var _ = require('lodash');
var log = require('util').log;
var observer = require('./observer');
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
    require('./routes/userArena')(app, passport);
    // user routes
    require('./routes/user')(app, passport);
    // group routes
    require('./routes/group')(app, passport);
    // member routes
    require('./routes/member')(app, passport);
    // quest routes
    require('./routes/quest')(app, passport);
    // userQuest routes
    require('./routes/userQuest')(app, passport);

    if (process.env.NODE_ENV !== 'production') {
        app.get('/seed_db', require('./seed_db'));
    }

    app.get('/pull/master', access.requireRole('admin'), function(req, res) {
        var exec = require('child_process').exec;
        exec('./pull.sh', {
            cwd: __dirname + '/..',
            env: process.env
        }, function(err, stout, sterr) {
            if (err) {
                log("failed to complete pull request");
                log(err);
                log(stout);
                log(sterr);
                return res.send(500);
            }
            if (sterr) {
                log(sterr);
                return res.send(500);
            }
            log("pull complete");
            return res.send(200);
        });
    });

    /**
     * POST /token
     * Sign in using identification and password.
     * @param {string} username
     * @param {string} password
     */

    app.post('/token', function(req, res, next) {
        req = processFields(req);
        passport.authenticate('local-login', function(err, user) {
            if (err) return next(err);
            if (user) {
                if (!user.activated) return res.send(400, {
                    message: 'This account is not Verified',
                    id: user.id,
                    email: user.email
                });
                observer.emit('user.login', user);
                res.send({
                    access_token: user.token,
                    user_id: user._id
                });
            } else res.send(403, {
                message: 'Incorrect username or password.'
            });
        })(req, res, next);
    });

    // logout
    app.del('/logout', access.hasToken, function(req, res) {
        observer.emit('user.logout', req.user);
        req.logout();
        res.send(204);
    });

    // confirmAccount after recieving verifcation
    app.get('/verify/:token', function(req, res, next) {
        ExpiringToken.useToken(req.params.token).then(function(token) {
            if (token) {
                User.findOne({
                    _id: token.user
                }).exec().then(function(user) {
                    user.activated = true;
                    user.save();
                    observer.emit('user.verified', user);
                    res.render('confirm.html', {
                        user: user
                    });
                }, next);
            } else {
                res.render("expiredToken.html");
            }
        }, next);
    });

    // render forgot password page
    app.get('/forgotpass/:token', function(req, res, next) {
        ExpiringToken.getToken(req.params.token).then(function(token) {
            if (token) {
                res.render('forgotPassword.html', {
                    token: token.id
                });
            } else {
                res.render("expiredToken.html");
            }
        }, next);
    });

    // reset forgot password page
    app.post('/forgotpass', function(req, res, next) {
        ExpiringToken.getToken(req.body.token).then(function(token) {
            if (token) {
                return Promise.fulfilled().then(function() {
                    return User.findOne({
                        _id: token.user
                    }).exec();
                }).then(function(user) {
                    if (req.body.password !== req.body.passwordConfirmation) {
                        throw {
                            http_code: 400,
                            message: 'Passwords do not match.'
                        };
                    }
                    user.password = req.body.password;
                    user.save(function(err, user) {
                        if (err) throw err;
                        res.render('confirm.html', {
                            user: user,
                        });
                        ExpiringToken.useToken(token.id);
                    });
                });
            } else {
                res.render("expiredToken.html");
            }
        }).catch(function(err) {
            if (err.http_code) {
                return res.send(err.http_code, err.message);
            }
            next(err);
        });
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
        Promise.fulfilled()
            .then(validateRequestBody(req))
            .then(processFields)
            .then(findUser)
            .spread(createIfNewUser)
            .then(emitAndRespond(res))
            .catch(function(err) {
                if (err.http_code) {
                    return res.send(err.http_code, err.message);
                }
                res.send(500, err.message);
            });
    });

    function validateRequestBody(req) {
        return function() {
            if (!req.body.username) {
                throw {
                    http_code: 400,
                    message: 'Username cannot be blank.'
                };
            }
            if (req.body.uniId && !/^\d+\-\d{3,5}$/.test(req.body.uniId)) {
                throw {
                    http_code: 400,
                    message: 'Invalid Uni ID'
                };
            }
            // if (!req.body.email) {
            //     throw {
            //         http_code: 400,
            //         message: 'Email cannot be blank.'
            //     };
            // }
            if (!req.body.password) {
                throw {
                    http_code: 400,
                    message: 'Password cannot be blank.'
                };
            }

            if (req.body.password !== req.body.passwordConfirmation) {
                throw {
                    http_code: 400,
                    message: 'Passwords do not match.'
                };
            }
            // if (!(/^.+@.+\..+$/.test(req.body.email) || /^\S+\.\S+@guc\.edu\.eg$/.test(req.body.email) || /^\S+\.\S+@student\.guc\.edu\.eg$/.test(req.body.email))) {
            //     throw {
            //         http_code: 401,
            //         message: 'Invalid Email'
            //     };
            // }
            return req;
        };
    }

    function processFields(req) {
        if (req.body.identification) {
            req.body.identification = _.trim(req.body.identification).toLowerCase();
        }
        if (req.body.username) {
            req.body.username = _.trim(req.body.username).toLowerCase();
        }
        if (!req.body.email && req.body.username) {
            req.body.email = req.body.username + "@student.guc.edu.eg";
        } else if (req.body.email) {
            req.body.email = req.body.email.toLowerCase();
        }
        return req;
    }

    function findUser(req) {
        return [
            req,
            User.findOne({
                $or: [{
                    'username': req.body.username
                }, {
                    'email': req.body.email,
                }]
            }).exec()
        ];
    }

    function createIfNewUser(req, user) {
        if (user) {
            throw {
                http_code: 400,
                message: 'User already exists'
            };
        }
        var role = getRoleByEmail(req.body.email);
        return Promise.fulfilled().then(function() {
            return User.find({}).count({}).exec();
        }).then(function(count) {

            var flags = getFlags({
                user: req.body,
                count: count
            });

            return User.create({
                username: req.body.username,
                email: req.body.email,
                uniId: req.body.uniId,
                lectureGroup: req.body.lectureGroup,
                labGroup: req.body.labGroup,
                password: req.body.password,
                role: role,
                flags: flags,
                activated: false
            });
        });
    }

    function getFlags(params) {
        var flags = {};
        var controle = ["EN 6","EN 7","EN 9","EN 11","EN 14","EN 15","EN 25","EN 16","EN 26","EN 27","EN 28","EN 31","EN 34","EN 41","EN 44","EN 45","BI 20","EN 5","EN 22","EN 32","EN 35","EN 37","EN 43","BI 24","BI 22"];
        var experiment = ["EN 1","EN 2","EN 3","EN 4","EN 8","EN 10","EN 13","EN 17","EN 18","EN 20","EN 21","EN 24","EN 30","EN 38","EN 40","EN 42","BI 19","EN 12","EN 19","EN 23","EN 29","EN 33","EN 36","EN 39","BI 21","BI 23"];
        if (~_.indexOf(controle, params.user.labGroup)) {
            flags.no_setup = flags.is_experiment = false;
        } else if (~_.indexOf(experiment, params.user.labGroup)) {
            flags.no_setup = flags.is_experiment = true;
        } else {
            flags.no_setup = flags.is_experiment = params.count%2===1;
        }
        flags.is_control = !flags.is_experiment;
        return flags;
    }

    function getRoleByEmail(email) {
        if (/^\S+\.\S+@guc\.edu\.eg$/.test(email)) {
            return 'teacher';
        } else if (/^\S+\.\S+@student\.guc\.edu\.eg$/.test(email)) {
            return 'student';
        }
        return 'student';
    }

    function emitAndRespond(res) {
        if (process.env.NODE_ENV === 'test') {
            return function(user) {
                observer.emit('user.signup', user);
                observer.once('test.user.signup.response', function(body) {
                    res.send(body);
                });
            };
        } else {
            return function(user) {
                observer.emit('user.signup', user);
                res.send(200, "Check your email for verification");
            };
        }
    }
};
