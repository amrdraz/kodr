var User = require('./models/user');
var access = require('./routes/access');
var Challenge = require('./models/challenge');

module.exports = function(app, passport) {

    // challenge routes
    require('./routes/challenge')(app, passport);
    // trial routes
    require('./routes/trial')(app, passport);

    /**
     * POST /token
     * Sign in using email and password.
     * @param {string} username
     * @param {string} password
     */

    app.post('/token', function(req, res, next) {
        passport.authenticate('local-login', function(err, user) {
            if (err) return next(err);
            if (user) res.send({
                access_token: user.token
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
                access_token: user.token
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

        User.findOne({
            'username': req.body.username
        }, function(err, user) {
            if (err) return next(err);
            if (user) return res.send(400, 'User exists');

            var newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password
            });

            newUser.save(function(err) {
                if (err) return res.send(500, err.message);
                res.send(200);
            });
        });

    });
};
