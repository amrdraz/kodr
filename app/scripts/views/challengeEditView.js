module.exports = Ember.View.extend({
    didInsertElement: function() {
        //refresh code editor tabs when selected
        Em.$('[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            // debugger;
            var editor = Em.$(Em.$(this).attr('href')+'Editor');
            if(editor.length!==0) {
                editor.data('CodeMirror').refresh();
                editor.data('CodeMirror').focus();
            }
        });
    }
});
