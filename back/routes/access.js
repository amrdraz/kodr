var User = require('../models/user');

 module.exports = {
     hasToken: function(req, res, next) {

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
