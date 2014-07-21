module.exports = App.ConsoleView = Em.View.extend({
    // classNames: [],
    didInsertElement: function() {

        var controller = this.get('controller');
        var that = this;
        var header = 'This is a console for you to test your code!\n' +
            'You can either type here or run your code to see what happens\n' +
            'When you are ready try submitting your code to see the results\n';
        var iframeTemplate = require('../demo/empty');
        var stuff = require('../../vendor/stuff');

        stuff(window.location.origin + '/iframe.html', this.$()[0], function(context) {
            controller.set('csandbox', context);
            context.load(iframeTemplate, function() {
                var jqconsole = that.$().jqconsole(header, "");
                controller.set('console', jqconsole);
                // Abort prompt on Ctrl+Z.
                jqconsole.RegisterShortcut('Z', function() {
                    jqconsole.AbortPrompt();
                    handler();
                });
                // Move to line start Ctrl+A.
                jqconsole.RegisterShortcut('A', function() {
                    jqconsole.MoveToStart();
                    handler();
                });
                // Move to line end Ctrl+E.
                jqconsole.RegisterShortcut('E', function() {
                    jqconsole.MoveToEnd();
                    handler();
                });
                // Move to line end Ctrl+E.
                jqconsole.RegisterShortcut('K', function() {
                    jqconsole.Clear();
                    handler();
                });
                jqconsole.RegisterMatching('{', '}', 'brace');
                jqconsole.RegisterMatching('(', ')', 'paran');
                jqconsole.RegisterMatching('[', ']', 'bracket');

                var log = function(msg) {
                    jqconsole.Write('==> ' + msg + '\n');
                };

                context.on('error', log);
                context.on('test.done', log);
                context.on('structure.done', log);
                context.on('log', log);

                // Handle a command.
                var handler = function(command) {
                    if (command) {
                        controller.send('consoleEval', command);
                    }
                    jqconsole.Prompt(true, handler, function(command) {
                        // Continue line if can't compile the command.
                        try {
                            Function(command);
                        } catch (e) {
                            if (/[\[\{\(]$/.test(command)) {
                                return 1;
                            } else {
                                if (/\n\s*$/.test(command)) {
                                    return false;
                                }
                                return 0;
                            }
                        }
                        return false;
                    });
                };

                // Initiate the first prompt.
                handler();
            });
        });
    }
});
