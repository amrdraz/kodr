

module.exports = function(app, passport) {
    //global events
    GLOBAL.kodrEventManager.on('working', function(on) {
        console.log('working', (on || ''));
    });
    GLOBAL.kodrEventManager.emit('working');
};
