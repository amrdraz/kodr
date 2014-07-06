module.exports = Em.TextArea.extend({
    // classNames: [],
    didInsertElement: function() {

        var debounce = require('../utils/debounce');
        var model = this.get('model');
        var attr = this.get('attr') || 'content';
// debugger;
        var editor = CodeMirror.fromTextArea(this.$()[0], {
            autofocus: true,
            lineNumbers: true,
            lineWrapping:true,
            mode: {
                name: (this.get('highlight') || 'javascript'),
                globalVars: true
            },
        });

        editor.getDoc().setValue(model.get(attr) || '');
        editor.on('change', debounce(function (cm) {

            model.set(attr, cm.getValue());
        }));

        this.set('editor', editor);
    }
});
