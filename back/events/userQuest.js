var _ = require('lodash');
var util = require('util');
var observer = require('../observer');
var ExpiringToken = require('../models/expiringToken');
var User = require('../models/user');
var mail = require('../config/mail');

exports.model = function (UserQuest) {
    observer.on('requirement.complete',function (req) {
        UserQuest.findOne({_id:{$in:req.userQuests},complete:false}).populate('requirements').exec().then(function (uq) {
            if(_.every(uq.requirements,'complete')) {
                uq.complete = true;
                uq.completeTime = Date.now();
                uq.save(function (err, model) {
                    if(err) throw err;
                    observer.emit('quest.complete',model);
                });
            }
        });
    });
};
