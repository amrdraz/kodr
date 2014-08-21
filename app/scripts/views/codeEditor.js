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
        this.updateEditor = function() {
            if (editor.getDoc().getValue() !== model.get(attr)){
                editor.getDoc().setValue(model.get(attr) || '');
            }
        };
        model.addObserver(attr, model, this.updateEditor);

        editor.on('change', debounce(function (cm) {
            model.set(attr, cm.getValue());
        }));
        
        this.set('editor', editor);
        //inorder to access it by selecting the element
        this.$().data('CodeMirror', editor);
    },
    willDestroyElement: function() {
        this.get('model').removeObserver(this.get('attr'), this.get('model'), this.updateEditor);
    }

});
