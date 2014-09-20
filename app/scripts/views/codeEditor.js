function getMIME(lang) {
    if (lang === 'java') return 'text/x-java';
    if (lang === 'c') return 'text/x-csrc';
    if (lang === 'cpp') return 'text/x-c++src';
    if (lang === 'c#') return 'text/x-csharp';
    return lang;
}

module.exports = Em.TextArea.extend({
    // classNames: [],

    check_syntax: function(code, result_cb) {
        // var error_list = [{
        //     line_no: 1,
        //     column_no_start: 14,
        //     column_no_stop: 17,
        //     fragment: "def doesNothing:\n",
        //     message: "invalid syntax",
        //     severity: "error"
        // }, {
        //     line_no: 4,
        //     column_no_start: 1,
        //     column_no_stop: 3,
        //     fragment: "a__ = 5\n",
        //     message: "convention violation",
        //     severity: "warning"
        // }];
        result_cb(this.get('errors') || []);
    },
    didInsertElement: function() {

        var debounce = require('../utils/debounce');
        var model = this.get('model');
        var attr = this.get('attr') || 'content';
        var highlight = this.get('highlight') && getMIME(this.get('highlight'));

        var editor = CodeMirror.fromTextArea(this.$()[0], {
            autofocus: true,
            lineNumbers: true,
            lineWrapping: true,
            styleActiveLine: true,
            mode: {
                name: (highlight || getMIME(model.get('language'))),
                globalVars: true,
                singleLineStringErrors: false
            },
            gutters: ["CodeMirror-lint-markers"],
            lint: {
                "getAnnotations": CodeMirror.remoteValidator,
                "async": true,
                "check_cb": this.check_syntax.bind(this)
            }
        });

        editor.getDoc().setValue(model.get(attr) || '');
        this.updateEditor = function() {
            if (editor.getDoc().getValue() !== model.get(attr)) {
                editor.getDoc().setValue(model.get(attr) || '');
            }
        };
        this.changeMode = function() {
            editor.setOption("mode", getMIME(model.get('language')));
        };
        model.addObserver(attr, model, this.updateEditor);
        !highlight && model.addObserver('language', model, this.changeMode);

        editor.on('change', debounce(function(cm) {
            model.set(attr, cm.getValue());
        }));

        this.set('editor', editor);
        //inorder to access it by selecting the element
        this.$().data('CodeMirror', editor);
    },
    willDestroyElement: function() {
        this.get('model').removeObserver(this.get('attr'), this.get('model'), this.updateEditor);
        !this.get('highlight') && this.get('model').removeObserver('language', this.get('model'), this.changeMode);
    }

});
