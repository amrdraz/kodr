module.exports = {
    mocha: function(code, tests) {
        return [
            'try {',
            '  window.code = JSON.parse(' + JSON.stringify(JSON.stringify(code)) + ');',
            code,
            '// Begin Tests',
            tests,
            '// End Tests',
            '',
            '  window.mocha.run();',
            '} catch(e) {',
            '  rethrow(e, JSON.parse(' + JSON.stringify(JSON.stringify(tests)) + '),2);',
            '}',
            true
        ].join('\n');
    },
    test: function(code, tests) {
        return [
            'try {',
            '  window.code = JSON.parse(' + JSON.stringify(JSON.stringify(code)) + ');',
            code,
            '// Begin Tests',
            tests,
            '// End Tests',
            '',
            ' jasmine.getEnv().execute();\
    if(!jasmine.getJSReport()) {\
        window.parent.stuffEmit("waiting");\
        window.parent.stuffEmit("log", "waiting...");\
    }',
            '} catch(e) {',
            '  rethrow(e, JSON.parse(' + JSON.stringify(JSON.stringify(tests)) + '),2);',
            '}',
            true
        ].join('\n');
    },

    structure: function(code, struct, callbacks) {
        return [
            'try {',
            '  var code = JSON.parse(' + JSON.stringify(JSON.stringify(code)) + ');',
            '  var struct = function () {' + struct + '};',
            '  var callbacks = ' + (callbacks || "{}") + ';',
            '  window.parent.stuffEmit("structure.done",{',
            '      result: Structured.match(code, struct, {varCallbacks: callbacks}),',
            '      errorMessage: callbacks',
            '  });',
            '} catch(e) {',
            '  rethrow(e, JSON.parse(' + JSON.stringify(JSON.stringify(code + struct + callbacks)) + '),0);',
            '}',
            true
        ].join('\n');
    }
};

export default undefined;
