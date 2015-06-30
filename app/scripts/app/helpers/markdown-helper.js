function escape(html, encode) {
        return html
            .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

Ember.Handlebars.helper('markdown-helper', function(value, options) {

    var marked = require('marked');
    marked.setOptions({
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
    });

    return marked(escape(value));
});
