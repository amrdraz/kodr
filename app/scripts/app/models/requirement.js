module.exports = Em.Object.extend({
    user:null,
    complete:null,
    completed:null,
    init: function() {
        this._super();
        this.setProperties({
            'modifier1': this.get('id1')?'specific':'any',
            'modifier2': this.get('id2')?'specific':'any'
        });
    },

    isAny1: function() {
        return this.get('modifier1') === 'any';
    }.property('modifier1'),
    isAny2: function() {
        return this.get('modifier2') === 'any';
    }.property('modifier2'),
    isChallenge: function() {
        return this.get('model1') === 'Challenge';
    }.property('model1'),
    isMultiple:function () {
        return this.get('times')>1;
    }.property('times'),
    progressInCSS:function () {
        return "width:"+(this.get('completed')*100/this.get('times'))+"%;";
    }.property('completed', 'times'),

    serialize: function () {
        var obj = this.getProperties(['model1', 'id1', 'model2', 'id2', 'times']);
        if(this.get('isAny1')) delete obj.id1;
        if(this.get('isAny2')) delete obj.id2;
        return obj;
    },

    getPropretiesTypeHash: function(model) {
        hash = {};
        App[model].__ember_meta__.cache.attributes.forEach(function(key, value) {
            hash[key] = value.type;
        });
        return hash;
    },
});
