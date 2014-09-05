module.exports = function(App) {
    App.Router.map(function() {
        this.route('login');
        this.route('logout');
        this.route('signup');
        this.route('about');
        this.route('profile');
        this.route('index', {
            path: '/'
        });
        this.resource('quest', {path:'quest/:quest_id'},function () {
            this.route('edit');
            this.route('assign');
        });
        this.resource('quests', {
            path: '/quests'
        }, function () {
            this.route('create');
        });
        this.resource('group', {path:'group/:group_id'},function () {
            this.route('edit');
        });
        this.resource('groups', {
            path: '/groups'
        }, function () {
            this.route('create');
        });
        this.resource('user', {path:'user/:user_id'},function () {
            this.route('edit');
        });
        this.resource('users', function () {
            this.route('create');
        });
        this.resource('arenaTrial', {
            path: '/arena/:arena_id' //used to load arena trial
        }, function() {
            this.resource('trial', {
                path: '/try/:trial_id' //used to load trial
            });
        });
        this.resource('arena', {
            path: '/arenas/:arena_id'
        }, function() {
            this.route('edit');
            this.resource('challenge', {
                path: 'challenge/:challenge_id'
            }, function() {
                this.route('edit');
                this.route('try');
            });
            this.resource('challenges', {
                path: 'challenge'
            }, function() {
                this.route('create');
            });
        });
        this.resource('arenas', {
            path: '/arenas'
        }, function() {
            this.route('create');
        });
    });
};
