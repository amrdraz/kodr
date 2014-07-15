var User = require('./models/user');
var Person = require('./models/person');
var Challenge = require('./models/challenge');

module.exports = function(app, passport) {


     /**
     * Find challenge by id.
     *
     * @param {string} id
     * @returns {object} challenge
     */

    app.get('/api/challenges/:id', function(req, res, next) {
        Challenge.findById(req.params.id, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(404, "Not Found");
            res.json({challenge:model});
        });
    });

     /**
     * get all challenges.
     *
     * @param range
     * @returns {object} person
     */

    app.get('/api/challenges', function(req, res, next) {
        Challenge.find({}, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(404, "Not Found");
            res.json({challenge:model});
        });
    });

    /**
     * Create new challenges.
     *
     * @param range
     * @returns {object} person
     */

    app.post('/api/challenges', hasToken,function(req, res, next) {
        req.body.author = req.id;
        Challenge.create(req.body.challenge, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(403, "Not Found");
            res.json({challenge:model});
        });
    });

    /**
     * Update new challenges.
     *
     * @param range
     * @returns {object} person
     */

    app.put('/api/challenges/:id', hasToken,function(req, res, next) {
        Challenge.findByIdAndUpdate(req.params.id,req.body.challenge, function(err, model) {
            if (err) return next(err);
            if (!model) return res.send(404, "Not Found");
            res.json({challenge:model});
        });
    });

    /**
     * Delete challenge.
     *
     * @param range
     * @returns {status} 200
     */

    app.del('/api/challenges/:id', hasToken,function(req, res, next) {
        Challenge.findByIdAndRemove(req.params.id, function(err, model) {
            if (err) return next(err);
            res.send(200);
        });
    });

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

    app.get('/profile', hasToken, function(req, res) {
        res.json(
            req.user
        );
    });

    app.post('/profile', hasToken, function(req, res) {
        req.user.set(req.body);
        var token = req.user.token;
        req.user.save(function(err, user) {
            res.json(user);
        });
    });

    // logout
    app.del('/logout', hasToken, function(req, res) {
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


    function isLoggedin(req, res, next) {

        // if user is authenticated continue
        if (req.isAuthenticated()) return next();

        res.send(401, "Unauthorized");

        // res.redirect('/');
    }

    function hasToken(req, res, next) {

        if (!req.get('Authorization')) {
            res.send(401, "Unauthorized");
            return;
        }
        var token = req.get('Authorization');

        User.findOne({
            token: token.replace('Bearer ', '')
        }, function(err, user) {
            if (err) return next(err);
            if (!user) return res.send(401, "Unauthorized");
            req.user = user;
            next();
        });

        // res.redirect('/');
    }
};
