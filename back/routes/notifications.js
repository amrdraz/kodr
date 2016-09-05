var Promise = require('bluebird');
var ExpiringToken = require('../models/expiringToken');
var access = require('./access');
var observer = require('../observer');
var Notification = require('../models/notification');

module.exports = function(app, passport) {

    /**
     * GET All notifications of specific query
     *
     * @param   query {optional}
     * @returns notifications
     */

    app.get('/api/notifications', access.requireRole() , function(req, res, next) {
        Notification.find({
                reciever: req.user,seen: false
            })
            .select('')
            .exec()
            .then(function(model) {
                if (!model) return res.send(404, "Not Found");
                res.json({
                    notifications: model
                });
            }, next);
    });

    app.put('/api/notifications/:id', function(req, res, next) {
        Notification.findById(req.params.id, function(err, model) {
            if (!model) return res.send(404, "Not Found");
            model.set(req.body.notification);
            model.save(function(err, notification) {
                if (err)
                    next(err);
                res.json({
                    notification: notification
                });
            });
        })
    });

    /**
     * Delete a notification.
     *
     * @param   notification id
     * @returns
     */

    app.delete('/api/notifications/:id', access.requireRole(), function(req, res, next) {
        Notification.findById(req.params.id, function(err, notification) {
            if (!notification)
                return next(new Error('Could find the Comment'));
            else {
                if (req.user._id.toString() === notification.reciever.toString()) {
                    notification.remove(function(err) {
                        if (err)
                            return next(err);
                        res.send(204);
                    });
                } else {
                    return res.send(401, "Unauthorized");
                }
            }
        });
    });

}
