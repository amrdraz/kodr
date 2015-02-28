var Promise = require('bluebird');
var _ = require('lodash');
var observer = require('../observer');

module.exports = exports = function lastModifiedPlugin(schema, options) {
    var Model = options.model || options;

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
                _id: {
                    $in: ids
                }
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

    schema.statics.getOneByQuery = function(query) {
        var model = this.db.model(Model);
        return Promise.fulfilled().then(function() {
            return model.findOne(query).exec();
        });
    };


    schema.statics.getByQuery = function(query) {
        if (query.ids) {
            query._id = {
                $in: query.ids
            };
            delete query.ids;
        }
        var model = this.db.model(Model);

        return Promise.fulfilled().then(function() {
            return model.find(query).exec();
        });
    };


    schema.statics.findOneByQueryOrCreate = function(query, update) {
        var model = this.db.model(Model);
        return model.getOneByQuery(query).then(function(m) {
            if (m) return m;
            return model.create(update);
        });
    };

};
