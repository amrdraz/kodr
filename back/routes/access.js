var _ = require('lodash');
var User = require('../models/user');

exports.hasToken = function(req, res, next) {

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
};

// requiering a role will also require that a user is logged in
exports.requireRole = function(roles) {
    return function(req, res, next) {
        if (req.user && _.contains(roles, req.user.role))
            next();
        else
        if (!req.get('Authorization')) {
            res.send(401, "Unauthorized");
            return;
        }
        var token = req.get('Authorization');

        User.findOne({
            token: token.replace('Bearer ', '')
        }, function(err, user) {
            // console.log(err, roles, user.role, (roles&& _.contains(roles,user.role)), _.contains(roles,'self'));
            // user && console.log(_.contains(roles,'self'), user._id,req.params.id, user._id.equals(req.params.id), user.id===req.params.id);
            if (err) return next(err);
            if  (
                !user ||
                ( roles && !_.contains(roles,user.role) ) ||
                //self is a special case where user has access to his own data
                ( roles && !_.contains(roles,user.role) && _.contains(roles,'$self') && !user._id.equals(req.params.id))
            ) {
                return res.send(401, "Unauthorized");
            }
            req.user = user;
            next();
        });

        // res.redirect('/');
    };
};
