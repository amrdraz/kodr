'use strict';


window.App = Ember.Application.create({
  LOG_ACTIVE_GENERATION: true,
  LOG_MODULE_RESOLVER: true,
  LOG_TRANSITIONS: true,
  LOG_TRANSITIONS_INTERNAL: true,
  LOG_VIEW_LOOKUPS: true,
});
App.ApplicationAdapter = DS.FixtureAdapter;

require('./router')(App);

require('./helpers/markdown-helper');

// Views
App.CodeEditorView = require('./views/codeEditor');
App.MarkedMathView = require('./views/markedMath');
App.ToggleView = require('./views/toggle');

// Route views
App.ApplicationView = require('./views/application');
App.ChallengeView = require('./views/challenge');

// Controllers
App.ChallengeController = require('./controllers/challenge');
App.ChallengeEditController = require('./controllers/challenge/edit');

// Models
App.Challenge = require('./models/challenge');

// Routes
App.IndexRoute = require('./routes/index.js');
App.ChallengeRoute = require('./routes/challenge');
App.ChallengesRoute = require('./routes/challenges');
App.ChallengesCreateRoute = require('./routes/challenges/create');




