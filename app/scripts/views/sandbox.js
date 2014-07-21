/**
 * Sandbox view for running challenge code, must run under a controller that impliments sandboxLoaded action.
 * @return {Em.View} 
 */
module.exports = Em.View.extend({
    tagName: 'div',
    // classNames: [],
    didInsertElement: function() {
        var stuff = require('../../vendor/stuff');
        var controller = this.get('controller');
        this.$().hide();
        if(!this.get('show')) {
            this.$().show();
        }
        var iframeTemplate = require('../demo/iframe');
        stuff(window.location.origin + '/iframe.html', this.$()[0], function(context) {
            controller.set('sandbox', context);
            context.load(iframeTemplate, function () {
                controller.send('sandboxLoaded', context);
            });
        });
    }
});
