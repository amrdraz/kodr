module.exports = Ember.View.extend({
    showConsole: function() {
        this.$('[href=#console]').tab('show');
    },
    didInsertElement: function() {
        this.get('controller').on('showConsole', this, this.showConsole);
        //refresh code editor tabs when selected
        Em.$('[data-toggle="tab"]').on('shown.bs.tab', function(e) {
            // debugger;
            var editor = Em.$(Em.$(this).attr('href') + 'Editor');
            if (editor.length !== 0) {
                editor.data('CodeMirror').refresh();
                editor.data('CodeMirror').focus();
            }
        });
    },
    willClearRender: function() {
        this.get('controller').off('showConsole', this, this.loginFail);
    }
});
