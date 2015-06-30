module.exports = Em.Controller.extend({
    // breadCrumb:'arena',
    // breadCrumbPath:'arenaTrial',
    needs: ['arenaTrial'],
    arena: Ember.computed.alias("controllers.arenaTrial.model"),
    trials: function() {
        return Ember.ArrayProxy.createWithMixins(Em.SortableMixin, {
            sortProperties: ['order'],
            content: this.get('model.trials')
        });
    }.property('model.trials'),
    init: function() {
        this._super();
        // this.addObserver('hasSandbox', this, function () {
        //     this.removeObserver('hasSandbox', this);
        //     var sb = this.get('sandbox');
        //     var console = this.get('console');
        //     var handler = function(msg) {
        //         console.Write('==> ' + msg + '\n');
        //     };

        //     sb.on('error', handler);
        //     sb.on('test.done', handler);
        //     sb.on('structure.done', handler);
        //     sb.on('log', handler);
        // });
    },
    currentTrial: function() {
        return this.get('model.trials.firstObject');
    }.property('arena.challenges.@each'),
    actions: {
        try: function(trial) {
            this.transitionToRoute('trial', trial);
        }
    }
});
