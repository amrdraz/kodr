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

function fullfilesRole(roles, user, params){
    if(_.isEmpty(roles)) return true;
    if (_.isArray(roles)) {
        return _.contains(roles, user.role) || ( _.contains(roles,'$self') && (user._id.toString()===params.id || user._id.toString()===params.uid) );
    }
    var role = _.find(roles.roles, {role:user.role});
    // console.log(role);
    if(!role) return false;
    if(role.all) return true;
    return _.find(user[role.in], function(id){ return id.toString()===params.id;});
}

// requiering a role will also require that a user is logged in
exports.requireRole = function(roles) {
    return function(req, res, next) {
        if (req.user && _.contains(roles, req.user.role))
            next();
        else if (!req.get('Authorization')) {
            res.send(401, "Unauthorized");
            return;
        }
        var token = req.get('Authorization');

        User.findOne({
            token: token.replace('Bearer ', '')
        }, function(err, user) {
            // console.log(err, roles, user.role, (roles&& _.contains(roles,user.role)), _.contains(roles,'self'));
            // user && console.log(_.contains(roles,'$self'),user._id,req.params.id,user._id.equals(req.params.id));
            if (err) return next(err);
            if  (!user || !fullfilesRole(roles, user, req.params))
            {
                return res.send(401, "Unauthorized");
            }
            req.user = user;
            next();
        });

        // res.redirect('/');
    };
};

/**
 * checks if id is in one of the users relationship array
 * eg. an id should be in his trials
 * @param  {String} attrs     the relationship to look for the id in
 */
exports.requireIn = function (attrs) {
    return function(req,res,next) {
        if(_.find(req.user[attrs], function(id){ return id.toString()===params.id;})) return next();
        res.send(401, "Unauthorized");  
    };
};
