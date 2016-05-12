/* globals before,after,beforeEach,afterEach,describe,it */
var Promise = require('bluebird');
var should = require('chai').should();
var assert = require('chai').assert;
var expect = require('chai').expect;
var request = require('supertest');
var setup = require('./setup');
var mongoose = require('mongoose');
var observer = require('../../back/observer');
var Arena = require('../../back/models/arena');
var UserArena = require('../../back/models/userArena');
var Challenge = require('../../back/models/challenge');
var User = require('../../back/models/user');
var Concept = require('../../back/models/concept');
var Trial = require('../../back/models/trial');
var UserConcept = require('../../back/models/userConcept');
var Suggestion = require('../../back/models/suggestion');
var _ = require('lodash');
var sinon = require('sinon');
require('../../back/events/userConcept_events');

describe('Adaptability', function() {
	before(function(done) {
		setup.clearDB(done);
	});

	describe('TestSuite', function() {
		var admin, user1, user2, arena, trials1, trials2;
		var concept1, concept2, concept3;
		beforeEach(function(done) {

			Promise.fulfilled().then(function() {

				var ad = User.create({
					name: "admin",
					role: "admin",
					username: "admin",
					email: "admin@mail.com"
				});
				var usr1 = User.create({
					name: "user 1",
					username: "user1",
					email: "user1@mail.com"
				});
				var usr2 = User.create({
					name: "user 2",
					username: "user2",
					email: "user2@mail.com"
				});
				return [ad, usr1, usr2];

			}).spread(function(ad, usr1, usr2) {

				admin = ad;
				user1 = usr1;
				user2 = usr2;
				var c1 = Concept.create({
					name: "Strings",
					author: admin._id
				});
				var c2 = Concept.create({
					name: "Conditionals",
					author: admin._id
				});
				var c3 = Concept.create({
					name: "Loops",
					author: admin._id
				});
				var ar = Arena.create({
					name: "Arena",
					author: admin._id
				});
				return [c1, c2, c3, ar];

			}).spread(function(c1, c2, c3, ar) {

				arena  = ar;
				concept1 = c1;
				concept2 = c2;
				concept3 = c3;
				var chs = [];
				var ch1 = Challenge.create({
					author: admin._id,
					concepts: [c1._id],
					exp: 10
				});
				var ch2 = Challenge.create({
					author: admin._id,
					concepts: [c2._id],
					exp: 10
				});
				var ch3 = Challenge.create({
					author: admin._id,
					concepts: [c3._id],
					exp: 10
				});
				var ch4;
				Concept.findOne({
					_id: c1._id
				}).exec().then(function(concept) {
					ch4 = Challenge.create({
						author: admin._id,
						concepts: [concept._id],
						exp: 10
					});
					chs = chs.push(ch4);
				});
				var ch5 = Challenge.create({
					author: admin._id,
					concepts: [c2._id],
					exp: 10
				});
				var ch6 = Challenge.create({
					author: admin._id,
					concepts: [c1._id, c2._id],
					exp: 10
				});
				var ch7 = Challenge.create({
					author: admin._id,
					concepts: [c1._id, c3._id],
					exp: 10
				});
				var ch8 = Challenge.create({
					author: admin._id,
					concepts: [c3._id, c2._id],
					exp: 10
				});
				var ch9 = Challenge.create({
					author: admin._id,
					concepts: [c1._id, c2._id, c3._id],
					exp: 10
				});
				var ch10 = Challenge.create({
					author: admin._id,
					concepts: [c1._id, c2._id, c3._id],
					exp: 10
				});
				chs = [ch1, ch2, ch3, ch5, ch6, ch7, ch8, ch9, ch10];
				var conArray = [c1, c2, c3];
				var uCs1 = Promise.each(conArray, function(con) {
					return UserConcept.create({
						user: user1._id,
						concept: con
					});
				});
				var uCs2 = Promise.each(conArray, function(con) {
					return UserConcept.create({
						user: user2._id,
						concept: con._id
					});
				});
				var uA1 = UserArena.create({
					arena: ar._id,
					user: user1._id
				});
				var uA2 = UserArena.create({
					arena: ar._id,
					user: user2._id
				});
				return [chs, conArray, uCs1, uCs2, uA1, uA2];

			}).spread(function(chs, conArray, uCs1, uCs2, uA1, uA2) {
				var t1 = Promise.each(chs, function(ch) {
					return Trial.create({
						challenge: ch._id,
						user: user1._id,
						userArena: uA1,
						arena: arena
					});
				});
				var t2 = Promise.each(chs, function(ch) {
					return Trial.create({
						challenge: ch._id,
						user: user2._id,
						userArena: uA2,
						arena: arena
					});
				});
				return [t1, t2];
			}).spread(function(t1, t2) {
				trials1 = t1;
				trials2 = t2;
			}).finally(done);

		});
		afterEach(setup.clearDB);

		it('should print concepts in trials', function(done) {
			// _.map(trials1, function(trial) {
			// 	console.log(trial.concepts);
			// });
			Concept.findOne({
				_id: concept1._id
			}).then(function(concept) {
				console.log(concept);
			});
			done();
		});

	});

});