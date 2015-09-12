var Promise = require('bluebird');
var passGen = require('random-password-generator');
var User = require('../models/user');
var UserQuest = require('../models/userQuest');
var ExpiringToken = require('../models/expiringToken');
var access = require('./access');
var mail = require('../config/mail');

module.exports = function(app, passport) {

    /**
     * Returns the data for the currently logged in user
     *
     * @returns {object} User
     */

    app.get('/profile', access.requireRole(), function(req, res) {
        Promise.fulfilled().then(function() {
            return [UserQuest.find({
                user: req.user.id
            }).exec()];
        }).spread(function(uqs) {
            res.send({
                user: req.user,
                userQuests: uqs
            });
        });
    });

    app.put('/profile', access.requireRole(), function(req, res) {

        if (req.body.user.password !== req.body.user.passwordConfirmation) {
            return res.send(400, 'Passwords do not match.');
        }
        req.user.set(req.body.user);
        req.user.save(function(err, user) {
            console.log('routes user put profile', err);
            if (err) res.send(500);
            res.json({
                user: user,
                access_token: user.token
            });
        });
    });


    /**
     * Find User by id.
     *
     * @param {string} id
     * @returns {object} User
     */

    app.get('/api/users/:id', access.requireRole(), function(req, res, next) {
        User.findById(req.params.id, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(404, "Not Found");
            res.json({
                user: model
            });
        });
    });

    /**
     * get all users.
     *
     * @param range
     * @returns {object} users
     */

    app.get('/api/users', access.requireRole(['student', 'teacher', 'admin']), function(req, res, next) {
        var query = req.query;
        if (query.ids) {
            req.query._id = {
                $in: req.query.ids
            };
            delete req.query.ids;
        }
        if (query.group === "null") {
            query.group = null;
        }
        switch (req.user.role) {
            case 'student':
                query.role = 'student';
                break;
            case 'teacher':
                query.role = {
                    $in: ['student', 'teacher']
                };
                break;
        }
        User.find(query).exec().then(function(model) {
            if (!model) return res.send(404, "Not Found");
            res.json({
                user: model
            });
        }, next);
    });

    /**
     * Create new users, generating password.
     *
     * @param range
     * @returns {object} user
     */

    app.post('/api/users', access.requireRole(['admin']), function(req, res, next) {
        var user = req.body.user;
        user.password = user.tempPassword = passGen.generate();
        User.create(user, function(err, model) {
            if (err) return next(err);
            res.json({
                user: model,
            });
        });
    });

    /**
     * Verify new user.
     *
     * @param range
     * @returns {object} user
     */

    app.post('/api/users/:id/verify',function(req, res, next) {
        var user;
        var token;
        User.getById(req.params.id).then(function(usr) {
            if (!usr) {
                throw {
                    http_code: 404,
                    message: 'Not Found'
                };
            }
            if (usr.activated) {
                throw {
                    http_code: 401,
                    message: 'User already activated'
                };
            }
            user = usr;
            return ExpiringToken.toVerify(usr);
        }).then(function(eToken) {
            token = eToken;
            var confirmURL = req.headers.host + '/verify/' + eToken._id;
            // template in views/mail
            return mail.renderAndSend('welcome.html', {
                confirmURL: confirmURL,
                password: user.tempPassword || undefined,
            }, {
                to: user.email,
                subject: 'You\'ve just joined an awesome experience',
                stub: process.env.NODE_ENV === 'test',
            });
        }).then(function(info) {
            if (process.env.NODE_ENV === 'test') {
                return res.send({
                    token: token._id,
                    info: info
                });
            } else {
                res.send({
                    message: 'Verification Email Sent'
                });
            }
        }).catch(function(err) {
            if (err.http_code) {
                res.status(err.http_code).send(err);
            }
            next(err);
        });

    });

    /**
     * Creates a token and sends a forgot password email.
     *
     * @param range
     * @returns {object} user
     */

    app.post('/api/users/forgotpass', function(req, res, next) {
        var user;
        var token;
        Promise.fulfilled().then(function() {
            return User.findByIdentity(req.body.identification);
        }).then(function(usr) {
            if (!usr) {
                throw {
                    http_code: 403,
                    message: "Identity does not exist"
                };
            }
            user = usr;
            return ExpiringToken.toForgotPassword(usr);

        }).then(function(eToken) {
            token = eToken;
            var confirmURL = req.headers.host + '/forgotpass/' + eToken._id;
            // template in views/mail
            return mail.renderAndSend('forgotpass.html', {
                confirmURL: confirmURL
            }, {
                to: user.email,
                subject: 'Forgot Password Request',
                stub: process.env.NODE_ENV === 'test',
            });
        }).then(function(info) {
            if (process.env.NODE_ENV === 'test') {
                return res.send({
                    token: token._id,
                    info: info
                });
            } else {
                res.send({
                    message: "Email was sent to reset your password"
                });
            }
        }).catch(function(err) {
            console.log(err.stack);
            if (err.http_code) {
                return res.send(err.http_code, err.message);
            }
            res.send(500, err.message);
        });
    });

    /**
     * Update users.
     *
     * @param range
     * @returns {object} user
     */

    app.put('/api/users/:id', access.requireRole(['$self', 'teacher', 'admin']), function(req, res, next) {
        var user = req.body.user;
        Promise.fulfilled().then(function() {
            if (user.password && user.password !== user.passwordConfirmation) {
                throw {
                    http_code: 403,
                    message: "passwords didn't match"
                };
            }
            return User.findOne({
                _id: req.params.id
            }).exec();
        }).then(function(model) {
            if (!model) throw {
                http_code: 404,
                message: "Not Found"
            };
            model.set(user);
            model.save(function(err, model) {
                if (err) return next(err);
                res.json({
                    user: model,
                    access_token: user.passwordConfirmation ? model.token : undefined
                });
            });
        }).catch(function(err) {
            if (err.http_code) {
                return res.send(err.http_code, err.message);
            }
            next(err);
        });
    });

    /**
     * Activate User manually
     */
    app.put('/api/users/:id/activate', access.requireRole(['admin']),function(req, res, next) {
        User.findByIdAndUpdate(req.params.id, {activated:true}, {new:true}, function (user) {
            res.send({
                user:user
            });
        });
    });

    /**
     * Delete user.
     *
     * @param range
     * @returns {status} 200
     */

    app.del('/api/users/:id', access.requireRole(['teacher', 'admin']), function(req, res, next) {
        User.findById(req.params.id, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(404);
            model.remove(function(err, model) {
                if (err) return next(err);
                res.send(200);
            });
        });
    });

};
