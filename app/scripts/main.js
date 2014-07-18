'use strict';

require('./utils/localStorageShim.js');

Ember.Application.initializer({
  name: 'authentication',
  initialize: function(container, application) {
    Ember.SimpleAuth.setup(container, application, {routeAfterLogin:'profile'});
  }
});


var App = window.App = Ember.Application.create({
    LOG_ACTIVE_GENERATION: true,
    LOG_MODULE_RESOLVER: true,
    LOG_TRANSITIONS: true,
    LOG_TRANSITIONS_INTERNAL: true,
    LOG_VIEW_LOOKUPS: true,
    currentPath: '',
});

App.ApplicationSerializer = DS.RESTSerializer.extend({
  primaryKey: '_id'
});

// App.ApplicationAdapter = DS.FixtureAdapter;
App.ApplicationAdapter = DS.RESTAdapter.extend({
  namespace: 'api'
});

// App.ChallengeAdapter = DS.FixtureAdapter;
App.TrialAdapter = DS.FixtureAdapter;

require('./router')(App);

require('./helpers/markdown-helper');

// Views
App.CodeEditorView = require('./views/codeEditor');
App.ConsoleView = require('./views/console');
App.SandboxView = require('./views/sandbox');
App.MarkedMathView = require('./views/markedMath');
App.ToggleView = require('./views/toggle');

// Route views
App.ApplicationView = require('./views/application');
App.ChallengeView = require('./views/challenge');

// Controllers
App.ApplicationController = require('./controllers/application');
App.LoginController = require('./controllers/login');
App.SignupController = require('./controllers/signup');
App.ChallengeController = require('./controllers/challenge');
App.ChallengeTryController = require('./controllers/trial');
App.ChallengeEditController = require('./controllers/challenge/edit');

// Models
App.Challenge = require('./models/challenge');
App.Trial = require('./models/trial');

// Routes
App.ApplicationRoute = require('./routes/application.js');
App.IndexRoute = require('./routes/index.js');
App.ProfileRoute = require('./routes/profile.js');
App.LoginRoute = require('./routes/login.js');


App.ChallengeRoute = require('./routes/challenge');
App.ChallengeTryRoute = require('./routes/challenge/try');

App.ChallengesRoute = require('./routes/challenges');
App.ChallengesCreateRoute = require('./routes/challenges/create');
