import Ember from 'ember';
import CustomSession from '/kodr/custom-session';
import CustomAuthenticator from '/kodr/custom-authenticator';

var ENV = ENV || {};
// configure an authorizer to be used
window.ENV['simple-auth'] = {
    session: 'session:custom',
    authorizer: 'simple-auth-authorizer:oauth2-bearer'
};
require('./utils/localStorageShim.js');
toastr.options = {
    "closeButton": true,
    "debug": false,
    "positionClass": "toast-bottom-right",
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};
require('../lib/ember-breadcrumbs/dist/ember-breadcrumbs');
BreadCrumbs.BreadCrumbsComponent.reopen({
    classNames: ["breadcrumb"]
});
Ember.Application.initializer({
    name: 'authentication',
    before: 'simple-auth',
    initialize: function(container, application) {
        // register the custom session so Ember Simple Auth can find it
        container.register('session:custom', CustomSession);
        // register the custom authenticator so the session can find it
        container.register('authenticator:custom', CustomAuthenticator);
    }
});
try {
    var emberSockets = EmberSockets; //cause I removed EmberSocket during testing
} catch(e) {
    var emberSockets = Ember.Object;
}
var App = Ember.Application.create({
    // @if DEBUG
    LOG_ACTIVE_GENERATION: true,
    LOG_MODULE_RESOLVER: true,
    LOG_TRANSITIONS: true,
    LOG_TRANSITIONS_INTERNAL: true,
    LOG_VIEW_LOOKUPS: true,
    // @endif
    // used to monotor current path
    currentPath: '',
    Socket: emberSockets.extend({
        // host: 'localhost',
        // port: 9000,
        // secure:true,
        controllers: ['application'],
        autoConnect: true
    })
});
// ChallengeAdapter = DS.FixtureAdapter;
// TrialAdapter = DS.FixtureAdapter;
Router.reopen({
  notifyGoogleAnalytics: function() {
    return ga('send', 'pageview', {
        'page': this.get('url'),
        'title': this.get('url')
      });
  }.on('didTransition')
});
require('./router')(App);
require('./helpers/markdown-helper');

export default ENV;
