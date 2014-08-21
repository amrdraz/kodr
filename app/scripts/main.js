'use strict';

  // configure an authorizer to be used
  window.ENV = window.ENV || {};
  window.ENV['simple-auth'] = {
    authorizer: 'simple-auth-authorizer:oauth2-bearer'
  };

require('./utils/localStorageShim.js');
require('../vendor/ember-woof');

      
// Ember.Application.initializer({
//   name: 'authentication',
//   initialize: function(container, application) {
//     Ember.SimpleAuth.setup(container, application, {routeAfterLogin:'profile'});
//   }
// });


var App = window.App = Ember.Application.create({
    LOG_ACTIVE_GENERATION: true,
    LOG_MODULE_RESOLVER: true,
    LOG_TRANSITIONS: true,
    LOG_TRANSITIONS_INTERNAL: true,
    LOG_VIEW_LOOKUPS: true,

    // used to monotor current path
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
// App.TrialAdapter = DS.FixtureAdapter;

require('./router')(App);

require('./helpers/markdown-helper');

// Components
App.XWoofComponent = Ember.Component.extend({
  classNames: 'woof-messages',
  messages: Ember.computed.alias('woof')
});

App.XWoofMessageComponent = Ember.Component.extend({
  classNames: ['x-woof-message-container'],
  classNameBindings: ['insertState'],
  insertState: 'pre-insert',
  didInsertElement: function() {
    var self = this;
    self.$().bind('webkitTransitionEnd', function(event) {
      if (self.get('insertState') === 'destroyed') {
        self.woof.removeObject(self.get('message'));
      }
    });
    Ember.run.later(function() {
      self.set('insertState', 'inserted');
    }, 250);
    
    if (self.woof.timeout) {
      Ember.run.later(function() {
        self.set('insertState', 'destroyed');
      }, self.woof.timeout);
    }
  },

  click: function() {
    var self = this;
    self.set('insertState', 'destroyed');
  }
});

// Views
App.CodeEditorView = require('./views/codeEditor');
App.ConsoleView = require('./views/console');
App.SandboxView = require('./views/sandbox');
App.MarkedMathView = require('./views/markedMath');
App.ToggleView = require('./views/toggle');
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
App.ChallengeController = require('./controllers/challenge');
App.ChallengeTryController = require('./controllers/trial');
App.ChallengeEditController = require('./controllers/challenge/edit');

App.ArenaController = require('./controllers/arena');
App.ArenaIndexController = require('./controllers/arena/index');
App.ArenaEditController = require('./controllers/arena/edit');

App.ArenaTrialController = require('./controllers/arenaTrial');
App.ArenaTrialIndexController = require('./controllers/arenaTrial/index');
App.TrialController = require('./controllers/trial');

// Models
App.User = require('./models/user');
App.Arena = require('./models/arena');
App.ArenaTrial = require('./models/arenaTrial');
App.Challenge = require('./models/challenge');
App.Trial = require('./models/trial');

// Routes
App.ApplicationRoute = require('./routes/application.js');
App.IndexRoute = require('./routes/index.js');
App.ProfileRoute = require('./routes/profile.js');
App.LoginRoute = require('./routes/login.js');

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
