module.exports = function(App) {
    App.Router.map(function() {
        this.route('login');
        this.route('logout');
        this.route('signup');
        this.route('protected');
        this.route('profile');
        this.route('index', {
            path: '/'
        });
        this.resource('challenge', {
            path: '/challenge/:id'
        }, function() {
            this.route('edit');
            this.route('try');
            this.route('preview');
        });
        this.resource('challenges', {
            path: '/challenges'
        }, function() {
            this.route('create');
            this.route('preview');
        });
    });
};
