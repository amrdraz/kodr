// Karma configuration
// Generated on Mon Sep 01 2014 14:14:38 GMT+0300 (EEST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha','chai'],
    // client: {
    //     mocha: {
    //         ui:'bdd',
    //     }
    // }

    // list of files / patterns to load in the browser
    files: [
            "app/lib/jquery/dist/jquery.min.js",
            "app/lib/handlebars/handlebars.js",
            "app/lib/socket.io-client/socket.io.js",
            "app/lib/ember/ember.js",
            "app/lib/ember-data/ember-data.js",
            // "app/lib/ember-sockets/dist/ember-sockets.js",
            "app/lib/ember-simple-auth/simple-auth.js",
            "app/lib/ember-simple-auth/simple-auth-oauth2.js",
            "app/lib/ember-validations-bower/ember-validations.js",
            "app/lib/bootstrap/dist/js/bootstrap.js",
            "app/lib/codemirror/lib/codemirror.js",
            // "app/lib/mocha/mocha.js",
            // "app/lib/chai/chai.js",
            "app/lib/ember-mocha-adapter/adapter.js",
            "app/lib/ember-qunit/dist/globals/main.js",
            "app/lib/MathJax/MathJax.js?config=TeX-AMS_HTML-full",
            "app/lib/jq-console/lib/jqconsole.js",
            "app/lib/jshint/dist/jshint.js",
            "app/vendor/blockies.min.js",
            "app/lib/chosen_v1.1.0/chosen.jquery.js",
            "app/lib/toastr/toastr.js",
            "app/lib/jquery-mockjax/jquery.mockjax.js",
            ".tmp/scripts/templates.js",
            ".tmp/scripts/build.js",
            // ".tmp/iframe/main.js",
            "test/browser/*.spec.js",
            // "test-main.js"
        ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    // host:'localhost',
    // web server port
    port: 3001,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,
    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],

    proxies:  {
    '/': 'http://localhost:3000/'
  },


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};
