// starting code from https://github.com/kerzol/markdown-mathjax/blob/master/editor.html

module.exports =Em.View.extend({
    tagName: 'div',
    classNames: ['preview'],
    preview: null, // filled in by Init below
    buffer: null, // filled in by Init below
    mjRunning: false, // true when MathJax is processing
    oldText: null, // used to check if an update is needed
    //
    //  Get the preview and buffer DIV's
    //
    PreviewDone: function() {
        this.mjRunning = false;
        var text = this.buffer.innerHTML;
        // replace occurrences of &gt; at the beginning of a new line
        // with > again, so Markdown blockquotes are handled correctly
        text = text.replace(/^&gt;/mg, '>');
        this.preview.innerHTML = this.marked(text);
    },
    Escape: function(html, encode) {
        return html.
            replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;').
            replace(/</g, '&lt;').
            replace(/>/g, '&gt;').
            replace(/"/g, '&quot;').
            replace(/'/g, '&#39;');
    },
    //
    //  Creates the preview and runs MathJax on it.
    //  If MathJax is already trying to render the code, return
    //  If the text hasn't changed, return
    //  Otherwise, indicate that MathJax is running, and start the
    //    typesetting.  After it is done, call PreviewDone.
    //  
    CreatePreview: function() {
        if (this.mjRunning) return;
        var text = this.get('model').get(this.get('observable'));
        if (text === this.oldtext) return;
        text = this.Escape(text); //Escape tags before doing stuff
        this.buffer.innerHTML = this.oldtext = text;
        this.mjRunning = true;
        MathJax.Hub.Queue(
            ["Typeset", MathJax.Hub, this.buffer], ["PreviewDone", this], ["resetEquationNumbers", MathJax.InputJax.TeX]
        );
    },

    didInsertElement: function() {
        var marked;
        this.preview = this.$()[0];
        // element for MathJax
        this.buffer = this.$('<div>')[0];

        this.marked = marked = require('marked');
        this.marked.setOptions({
            renderer: new marked.Renderer(),
            highlight: function(code) {
                return require('highlight.js').highlightAuto(code).value;
            },
            gfm: true,
            tables: true,
            breaks: false,
            pedantic: false,
            sanitize: false,
            smartLists: true,
            smartypants: false
        });
        var callback = this.callback = MathJax.Callback(["CreatePreview", this]);
        callback.autoReset = true;
        // var that = this;
        // this. once = function () {
        //     if(!that.isDestroyed){
        //         callback();
        //     } else {
        //         // because the observer is still attached
        //         this.removeObserver(that.get('observable'), this, once);
        //     }       
        // };
        this.get('model').addObserver(this.get('observable'), this.get('model'),this.callback);
        callback();
    },
    willDestroyElement: function () {
        this.get('model').removeObserver(this.get('observable'), this.get('model'),this.callback);
    }
});
