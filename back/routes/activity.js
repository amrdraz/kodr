var Promise = require('bluebird');
var _ = require('lodash');
var User = require('../models/user');
var access = require('./access');
var Activity = require('../models/activity');

module.exports = function(app, passport) {

    /**
     * Create new activity.
     *
     * @param range
     * @returns {object} activity
     */

    app.post('/api/activity', function(req, res, next) {
        Activity.new({
            action: req.body.action,
            event: req.body.event,
            objectMeta: req.body.meta
        }).then(function(activity) {
            res.json({
                activity: activity
            });
        }).catch(next);
    });

    /**
     * get all activities.
     *
     * @param range
     * @returns {object} activity
     */

    app.get('/api/activities', function(req, res, next) {

        Activity.getByQuery(req.query).then(function(model) {
            res.json({
                activity: model
            });
        }).catch(next);
    });

};
