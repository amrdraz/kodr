'use strict';


window.App = Ember.Application.create();
App.ApplicationAdapter = DS.FixtureAdapter;

require('./router')(App);

require('./helpers/markdown-helper');

App.CodeEditorView = require('./views/codeEditor');
App.MarkedMathView = require('./views/markedMath');

App.ApplicationView = require('./views/application');
App.ChallengeView = require('./views/challenge');

App.ChallengeController = require('./controllers/challenge');

App.Challenge = require('./models/challenge');

App.ChallengeRoute = require('./routes/challenge');



