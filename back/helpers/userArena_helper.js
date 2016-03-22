var Promise = require('bluebird');
var mongoose = require('mongoose');
var _ = require('lodash');
var observer = require('../observer');

module.exports = exports = function lastModifiedPlugin(schema, options) {
    var Model = options.model || options;
    schema.plugin(require('./_common_helper'), options);

    schema.methods.getCompletedTrials = function() {
        var Trial = mongoose.model('Trial');
        return Promise.fulfilled().then(function() {
            return Trial.find({
                userArena: this._id,
                complete: true
            }).exec();
        });
    };

    /**
     * Get Challenges in this arena
     * @return {Promise} contining array of challanges
     */
    schema.methods.getArenaChallenges = function() {
        var Challenge = mongoose.model('Challenge');
        var doc = this;
        return Promise.fulfilled().then(function() {
            return Challenge.find({
                arena: doc.arena,
            }).sort('order exp').exec();
        });
    };

    function getInitialWorkObj(challenge, user) {
        var work = {};
        switch(challenge.type) {
        case "python":
            work = {
                solution:challenge.setup
            };
            if(user.flags && user.flags.no_setup) {
                work.solution = "";
            }
            break;
        }
        return work;
    }

    /**
     * Find or create an UserArena along with it's associated Trials
     * @param  {hash} userArena arena trial to create requires arena and user
     * @param  {boolean} withoutTrials wether to create trials along with this arena trial
     * @return {Promise} array contianing userArena as first element and trials as second unless withoutTrials is true
     */
    schema.statics.findOrCreateWithTrials = function(userArena) {
        var UserArena = mongoose.model('UserArena');
        var Trial = mongoose.model('Trial');
        // var obj = {arena:userArena.arena, userArena:userArena.id, user:userArena.user};
        // var update = _.clone(obj);
        return Arena.getOneByQuery({
            // Return the arena to check for prerequisits
            arena: userArena.arena
        }).then(function(arena) {

            //////////// Aly Yakan ////////////////
            var prerequisit = arena.prerequisit;
            if (prerequisit) {
                UserArena.getOneByQuery({
                    // Get the userArena of the prerequisit to check if it's cleared or not
                    arena: prerequisit
                }).then(function(preUserArena) {
                    var locked = false;
                    if (preUserArena.complete === false)
                        locked = true;

                    // return findOrCreateWithTrialsHelper({
                    //     user: userArena.user,
                    //     arena: userArena.arena,
                    //     locked: locked
                    // }, userArena);

                    return UserArena.getOneByQueryOrCreate({
                        user: userArena.user,
                        arena: userArena.arena,
                        locked: locked,
                        prerequisit: prerequisit
                    }, userArena).then(function(model) {
                        var trials = Promise.map(model.getArenaChallenges(), function(challenge) {
                            return Trial.findOrCreate({
                                userArena: model._id,
                                arena: model.arena,
                                user: model.user,
                                challenge: challenge._id,
                                work: getInitialWorkObj(challenge, userArena.user),
                                blueprint: challenge.blueprint,
                                group: challenge.group,
                                order: challenge.order,
                                code: challenge.setup,
                                completed: 0
                            });
                        });
                        var at = trials.then(function(mods) {
                            return UserArena.getById(model.id);
                        });
                        return [at, trials];
                    });

                });
            } else {
                // No prerequisit, locked's default is false

                // return findOrCreateWithTrialsHelper({
                //     user: userArena.user,
                //     arena: userArena.arena
                // }, userArena);

                return UserArena.getOneByQueryOrCreate({
                    user: userArena.user,
                    arena: userArena.arena
                }, userArena).then(function(model) {
                    var trials = Promise.map(model.getArenaChallenges(), function(challenge) {
                        return Trial.findOrCreate({
                            userArena: model._id,
                            arena: model.arena,
                            user: model.user,
                            challenge: challenge._id,
                            work: getInitialWorkObj(challenge, userArena.user),
                            blueprint: challenge.blueprint,
                            group: challenge.group,
                            order: challenge.order,
                            code: challenge.setup,
                            completed: 0
                        });
                    });
                    var at = trials.then(function(mods) {
                        return UserArena.getById(model.id);
                    });
                    return [at, trials];
                });
            }
            
        });
        /////////////// End Aly Yakan //////////////////


        // return UserArena.getOneByQueryOrCreate({
        //     user: userArena.user,
        //     arena: userArena.arena
        // }, userArena).then(function(model) {
        //     var trials = Promise.map(model.getArenaChallenges(), function(challenge) {
        //         return Trial.findOrCreate({
        //             userArena: model._id,
        //             arena: model.arena,
        //             user: model.user,
        //             challenge: challenge._id,
        //             work: getInitialWorkObj(challenge, userArena.user),
        //             blueprint: challenge.blueprint,
        //             group: challenge.group,
        //             order: challenge.order,
        //             code: challenge.setup,
        //             completed: 0
        //         });
        //     });
        //     var at = trials.then(function(mods) {
        //         return UserArena.getById(model.id);
        //     });
        //     return [at, trials];
        // });
    };

    function findOrCreateWithTrialsHelper(obj, userArena) {
        return UserArena.getOneByQueryOrCreate(obj, userArena).then(function(model) {
            var trials = Promise.map(model.getArenaChallenges(), function(challenge) {
                return Trial.findOrCreate({
                    userArena: model._id,
                    arena: model.arena,
                    user: model.user,
                    challenge: challenge._id,
                    work: getInitialWorkObj(challenge, userArena.user),
                    blueprint: challenge.blueprint,
                    group: challenge.group,
                    order: challenge.order,
                    code: challenge.setup,
                    completed: 0
                });
            });
            var at = trials.then(function(mods) {
                return UserArena.getById(model.id);
            });
            return [at, trials];
        });
    }

};
