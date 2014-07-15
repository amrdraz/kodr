var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport) {
    // serialize user id ito cookie for session
    // required for persistent login
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // deserialize user form cookie
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // passport.use(new LocalStrategy(function(username, password, done) {
    //     User.findOne({
    //         username: username
    //     }, function(err, user) {
    //         if (err) return done(err);
    //         if (!user) return done(null, false);
    //         user.comparePassword(password, function(err, isMatch) {
    //             if (err) return done(err);
    //             if (isMatch) return done(null, user);
    //             return done(null, false);
    //         });
    //     });
    // }));
     
    

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true // allows request in the callback
    }, function(req, identity, password, done) {

        // make things asynchronus
        // only fire findOne when we have data
        process.nextTick(function() {

            User.findOne({
                $or: [
                    {'email': identity},
                    {'username': identity}
                ]
            }, function(err, user) {
                if (err) return done(err);

                // check if user with this email already exists
                if (!user) {
                    return done(null, false, req.flash('loginMessage', 'Invalide username or password'));
                }

                user.comparePassword(password, function(err, isMatch) {
                    if (err) return done(err);
                    if (isMatch) return done(null, user);
                    return done(null, false, req.flash('loginMessage', 'Invalide username or password'));
                });

            });
        });

    }));

};
