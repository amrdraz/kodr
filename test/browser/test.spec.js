/* globals describe,before,beforeEach,after,afterEach,$,it,visit,fillIn,loginUser,andThen*/
// App.setupForTesting();
// App.injectTestHelpers();

describe('Test', function() {
    before(function(done) {
        $.get('/seed_db', function(res) {
            done();
        });
    });
    after(function() {
        App.reset();
    });

    it('should login as teacher', function() {
        loginUser('teacher', 'teacher123');
        andThen(function () {
            App.__container__.lookup('session:custom').get('user').should.exist;
        });
    });

    describe('Quest', function () {
        it('should list quests under /quests', function () {
            loginUser('teacher', 'teacher123');
            visit('/quests');
            andThen(function() {
                find("ul.list-group li").length.should.equal(1);
            });
        });
    });

});