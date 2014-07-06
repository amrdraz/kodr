module.exports = function(App) {
    App.Router.map(function() {
        this.resource('challenge', {path:'/challenge'});
        this.resource('challenges', { path: '/challenges' });
    });
};
