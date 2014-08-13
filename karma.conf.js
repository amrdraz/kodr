// Karma configuration
// Generated on Sat Aug 09 2014 17:11:03 GMT+0300 (EEST)

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['qunit'],


        // list of files / patterns to load in the browser
        files: [
            "app/lib/jquery/dist/jquery.min.js",
            "app/lib/handlebars/handlebars.js",
            "app/lib/ember/ember.js",
            "app/lib/ember-data/ember-data.js",
            "app/lib/ember-qunit/dist/globals/main.js",
            "app/lib/bootstrap/dist/js/bootstrap.js",
            "app/lib/codemirror/lib/codemirror.js",
            "app/lib/mocha/mocha.js",
            "app/lib/chai/chai.js",
            "app/vendor/ember-simple-auth.js",
            "app/lib/ember-validations-bower/ember-validations.js",
            "app/vendor/MathJax/MathJax.js?config=TeX-AMS_HTML-full",
            "app/lib/jq-console/lib/jqconsole.js",
            "app/lib/jshint/dist/jshint.js",
            "app/lib/jquery-mockjax/jquery.mockjax.js",
            ".tmp/scripts/templates.js",
            ".tmp/scripts/build.js",
            "test/browser/*.js",
        ],


        // list of files to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {},


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_ERROR,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    });
};
