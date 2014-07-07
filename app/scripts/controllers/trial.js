module.exports = App.ChallengeTryController = Em.ObjectController.extend({
    needs: ['challenge'],
    // 
    actions: {
        run: function() {
            this.get('controllers.challenge').send('run');
        }
    }
});
