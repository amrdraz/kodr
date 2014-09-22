function getMIME(lang) {
    if (lang === 'java') return 'text/x-java';
    if (lang === 'c') return 'text/x-csrc';
    if (lang === 'cpp') return 'text/x-c++src';
    if (lang === 'c#') return 'text/x-csharp';
    return lang;
}

// function hijack(func, trigger, that) {
//     trigger.cb = function() {console.log("not yet assigned");};
//     var called = false;
//     return function() {
//         if (!called) {
//             trigger.cb = arguments[1];
//             called = true;
//             trigger();
//         }
//         func.apply(that, arguments);
//     };
// }
module.exports = Em.TextArea.extend({
    // classNames: [],
    // spy: function(cmd,cb) {
    //     console.log('hey');
    //     if(cmd==='set')  {
    //         this.cb = cb;
    //     } else {
    //         console.log(cmd);
    //         cb(cmd);
    //     }
    // },
    check_syntax: function(code, result_cb) {
        // this.spy('set',result_cb);
    },
    didInsertElement: function() {

        var debounce = require('../utils/debounce');
        var model = this.get('model');
        var highlight = this.get('highlight') && getMIME(this.get('highlight'));
        var config = {
            autofocus: true,
            lineNumbers: true,
            lineWrapping: true,
            styleActiveLine: true,
            mode: {
                name: (highlight || getMIME(model.get('language'))),
                globalVars: true,
                singleLineStringErrors: false
            }
        };
        var attr = this.get('attr') || 'content';
        var lint = this.get('lint');
        // compileErrors
        if (lint) {
            config.gutters = ["CodeMirror-lint-markers"];
            config.lint = {};
            // this.get('controller').on('spy', this, this.spy);
        }

        var editor = CodeMirror.fromTextArea(this.$()[0], config);

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
        // this.get('lint') && this.get('controller').off('spy', this, this.spy);
    }

});
