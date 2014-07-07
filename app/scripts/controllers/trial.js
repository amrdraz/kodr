module.exports = App.ChallengeTryController = Em.ObjectController.extend({
    needs: ['challenge'],
    //
    results: "Run Code to see output",
    actions: {
        run: function() {
            this.get('controllers.challenge').send('run');
        }
    }
});
