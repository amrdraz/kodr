var Promise = require('bluebird');
var _ = require('lodash');
var observer = require('../observer');

module.exports = exports = function lastModifiedPlugin(schema, options) {
    var Model  = options.model || options;

    schema.statics.getById = function(id) {
        var model = this.db.model(Model);
        return Promise.fulfilled().then(function() {
            return model.findOne({
                _id: id
            }).exec();
        });
    };

    schema.statics.getByIds = function(ids) {
        var model = this.db.model(Model);
        return Promise.fulfilled().then(function() {
            return model.find({
                _id: {$in:ids}
            }).exec();
        });
    };

    schema.statics.getById_404 = function(id) {
        var model = this.db.model(Model);
        return model.getById(id).then(function(g) {
            if (!g) throw {
                http_code: 404,
                message: "Not Found"
            };
            return g;
        });
    };


    schema.statics.findByQueryOrCreate = function(query,update) {
        var model = this.db.model(Model);
        return Promise.fulfilled().then(function () {
            return model.findOne(query).exec();
        }).then(function(m) {
            if (m) return m;
            return model.create(update);
        });
    };

};
