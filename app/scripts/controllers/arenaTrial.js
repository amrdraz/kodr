module.exports = App.ArenaTryController = Em.ObjectController.extend({
    needs: ['arena'],
    arena: Ember.computed.alias("controllers.arena"),
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
    currentTrial:function () {
        return this.get('model.trials.firstObject');
    }.property('arena.challenges.@each'),
    actions: {
    }
});
