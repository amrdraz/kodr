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
        sanitize: true,
        smartLists: true,
    });

    return marked(value);
});
