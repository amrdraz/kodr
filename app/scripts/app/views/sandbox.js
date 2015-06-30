import Ember from 'ember';
import stuff from '/kodr/'../../vendor/stuff'';
import iframeTemplate from '/kodr/'../demo/iframe'';

var SandboxView = require('./views/sandbox');
/**
 * Sandbox view for running challenge code, must run under a controller that impliments sandboxLoaded action.
 * @return {Ember.View} 
 */
module.exports = Ember.View.extend({
    tagName: 'div',
    // classNames: [],
    didInsertElement: function() {
        var controller = this.get('controller');
        this.$().hide();
        if(!this.get('show')) {
            this.$().show();
        }
        stuff(window.location.origin + '/iframe.html', this.$()[0], function(context) {
            controller.set('sandbox', context);
            context.load(iframeTemplate, function () {
                controller.send('sandboxLoaded', context);
            });
        });
    }
});

export default SandboxView;
