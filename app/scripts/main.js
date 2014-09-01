'use strict';

window.ENV = window.ENV || {};
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
        container.register('session:custom', App.CustomSession);
        // register the custom authenticator so the session can find it
        container.register('authenticator:custom', App.CustomAuthenticator);
    }
});

// Ember.Application.initializer({
//   name: 'authentication',
//   initialize: function(container, application) {
//     Ember.SimpleAuth.setup(container, application, {routeAfterLogin:'profile'});
//   }
// });


var App = window.App = Ember.Application.create({
    // @if DEBUG
    LOG_ACTIVE_GENERATION: true,
    LOG_MODULE_RESOLVER: true,
    LOG_TRANSITIONS: true,
    LOG_TRANSITIONS_INTERNAL: true,
    LOG_VIEW_LOOKUPS: true,
    // @endif
    // used to monotor current path
    currentPath: '',
    Socket: EmberSockets.extend({
        //     host: 'localhost',
        // port: 3502,
        // secure:true,
        controllers: ['application'],
        autoConnect: true
    })
});

App.ApplicationSerializer = DS.RESTSerializer.extend({
    primaryKey: '_id'
});

// App.ApplicationAdapter = DS.FixtureAdapter;
App.ApplicationAdapter = DS.RESTAdapter.extend({
    namespace: 'api'
});

App.GroupSerializer = DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, {
    primaryKey: '_id',
    attrs: {
        // author: {embedded: 'always'},
        members: {
            serialize: 'ids'
        }
    }
});

// App.ChallengeAdapter = DS.FixtureAdapter;
// App.TrialAdapter = DS.FixtureAdapter;

require('./router')(App);

require('./helpers/markdown-helper');


// the custom session that handles an authenticated account
App.CustomSession = SimpleAuth.Session.extend({
    user: function() {
        var userId = this.get('user_id');
        if (!Ember.isEmpty(userId)) {
            return this.container.lookup('store:main').find('user', userId);
        }
    }.property('user_id'),
    isTeacher: function() {
        return this.get('user.role') === 'teacher';
    }.property('user.role'),
    isStudent: function() {
        return this.get('user.role') === 'student';
    }.property('user.role')
});

// the custom authenticator that handles the authenticated account
App.CustomAuthenticator = SimpleAuth.Authenticators.OAuth2.extend({
    authenticate: function(credentials) {
        return new Ember.RSVP.Promise(function(resolve, reject) {
            // make the request to authenticate the user at endpoint /v3/token
            Ember.$.ajax({
                url: '/token',
                type: 'POST',
                data: {
                    grant_type: 'password',
                    identification: credentials.identification,
                    password: credentials.password
                }
            }).then(function(response) {
                Ember.run(function() {
                    // resolve (including the user id) as the AJAX request was successful; all properties this promise resolves
                    // with will be available through the session
                    resolve({
                        access_token: response.access_token,
                        user_id: response.user_id
                    });
                });
            }, function(xhr, status, error) {
                Ember.run(function() {
                    reject(xhr.responseText);
                });
            });
        });
    }
});

// Views
App.CodeEditorView = require('./views/codeEditor');
App.ConsoleView = require('./views/console');
App.SandboxView = require('./views/sandbox');
App.MarkedMathView = require('./views/markedMath');
App.ToggleView = require('./views/toggle');
App.ProfileIconView = require('./views/profile-icon');
require('./views/ember-chosen');

// Route views
App.ApplicationView = require('./views/application');
App.ChallengeEditView = require('./views/challengeEditView');
App.ChallengeTryView = require('./views/challengeEditView');
App.ArenaTrialTrialView = require('./views/challengeEditView');

// Controllers
App.ApplicationController = require('./controllers/application');
App.LoginController = require('./controllers/login');
App.SignupController = require('./controllers/signup');

App.GroupController = require('./controllers/group');
App.GroupEditController = require('./controllers/group/edit');
// App.GroupsController = require('./controllers/group');
App.GroupsIndexController = require('./controllers/groups/index');
App.GroupsCreateController = require('./controllers/group/edit');

App.ChallengeController = require('./controllers/challenge');
App.ChallengeTryController = require('./controllers/trial');
App.ChallengeEditController = require('./controllers/challenge/edit');

App.ArenasIndexController = require('./controllers/arenas/index');

App.ArenaController = require('./controllers/arena');
App.ArenaIndexController = require('./controllers/arena/index');
App.ArenaEditController = require('./controllers/arena/edit');

App.ArenaTrialController = require('./controllers/arenaTrial');
App.ArenaTrialIndexController = require('./controllers/arenaTrial/index');
App.TrialController = require('./controllers/trial');

// Models
App.User = require('./models/user');
App.Group = require('./models/group');
App.Arena = require('./models/arena');
App.ArenaTrial = require('./models/arenaTrial');
App.Challenge = require('./models/challenge');
App.Trial = require('./models/trial');

// Routes
App.ApplicationRoute = require('./routes/application.js');
App.IndexRoute = require('./routes/index.js');
App.ProfileRoute = require('./routes/profile.js');
App.LoginRoute = require('./routes/login.js');

App.GroupRoute = require('./routes/group');
App.GroupIndexRoute = require('./routes/group/index');
App.GroupEditRoute = require('./routes/group/edit');

App.GroupsRoute = require('./routes/groups');
App.GroupsCreateRoute = require('./routes/groups/create');

App.ChallengeRoute = require('./routes/challenge');
App.ChallengeIndexRoute = require('./routes/challenge/index');
App.ChallengeEditRoute = require('./routes/challenge/edit');
App.ChallengeTryRoute = require('./routes/challenge/try');

App.ChallengesCreateRoute = require('./routes/challenges/create');

App.ArenaTrialRoute = require('./routes/arenaTrial');
App.ArenaTrialIndexRoute = require('./routes/arenaTrial/index');
App.ArenaTrialTryRoute = require('./routes/arenaTrial/try');

App.ArenaRoute = require('./routes/arena');
App.ArenaIndexRoute = require('./routes/arena/index');
App.ArenaEditRoute = require('./routes/arena/edit');

App.ArenasRoute = require('./routes/arenas');
App.ArenasCreateRoute = require('./routes/arenas/create');
