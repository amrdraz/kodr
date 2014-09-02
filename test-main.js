
Ember.$(function() {
  window.__karma__.start()
  mocha.run();

});

// var allTestFiles = [
//             "app/lib/jquery/dist/jquery.min.js",
//             "app/lib/handlebars/handlebars.js",
//             "app/lib/socket.io-client/socket.io.js",
//             "app/lib/ember/ember.js",
//             "app/lib/ember-data/ember-data.js",
//             "app/lib/ember-sockets/dist/ember-sockets.js",
//             "app/lib/ember-simple-auth/simple-auth.js",
//             "app/lib/ember-simple-auth/simple-auth-oauth2.js",
//             "app/lib/ember-validations-bower/ember-validations.js",
//             "app/lib/ember-qunit/dist/globals/main.js",
//             "app/lib/bootstrap/dist/js/bootstrap.js",
//             "app/lib/codemirror/lib/codemirror.js",
//             // "app/lib/mocha/mocha.js",
//             "app/lib/chai/chai.js",
//             "app/lib/MathJax/MathJax.js?config=TeX-AMS_HTML-full",
//             "app/lib/jq-console/lib/jqconsole.js",
//             "app/lib/jshint/dist/jshint.js",
//             "app/vendor/blockies.min.js",
//             "app/lib/chosen_v1.1.0/chosen.jquery.js",
//             "app/lib/toastr/toastr.js",
//             "app/lib/jquery-mockjax/jquery.mockjax.js",
//             ".tmp/scripts/templates.js",
//             ".tmp/scripts/build.js",
//             ".tmp/iframe/main.js",
//             "test/browser/*.js",
//         ];
// var TEST_REGEXP = /(spec|test)\.js$/i;

// var pathToModule = function(path) {
//   return path.replace(/^\/base\//, '').replace(/\.js$/, '');
// };

// Object.keys(window.__karma__.files).forEach(function(file) {
//   if (TEST_REGEXP.test(file)) {
//     // Normalize paths to RequireJS module names.
//     allTestFiles.push(pathToModule(file));
//   }
// });

// require.config({
//   // Karma serves files under /base, which is the basePath from your config file
//   baseUrl: '/',

//   // dynamically load all test files
//   deps: allTestFiles,

//   // we have to kickoff jasmine, as it is asynchronous
//   callback: window.__karma__.start
// });


