module.exports = function(App) {
    App.Router.map(function() {
        this.route('index', {path:'/'});
        this.resource('challenge', {path:'/challenge/:id'}, function () {
            this.route('edit');
            this.route('try');
            this.route('preview');
        });
        this.resource('challenges', { path: '/challenges' }, function () {
            this.route('create');
            this.route('preview');
        });
    });
};
