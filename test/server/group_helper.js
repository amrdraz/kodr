/*globals before,after,beforeEach,afterEach,describe,it */
var Promise = require('bluebird');
var _ = require('lodash');
var should = require('chai').should();
var expect = require('chai').expect;
var request = require('supertest');
var setup = require('./setup');

var Group = require('../../back/models/group');
var Challenge = require('../../back/models/challenge');
var Trial = require('../../back/models/trial');
var User = require('../../back/models/user');
var observer = require('../../back/observer');

describe('Group Helper', function() {
    before(function(done) {
        return setup.clearDB(done);
    });

    var student,
        student2,
        teacher,
        group, challenge, challenge2;
    beforeEach(function(done) {
            student = {
                username: 'student',
                email: 'student@place.com',
                password: 'student123',
                role: 'student',
                activated: true
            };
            student2 = {
                username: 'student2',
                email: 'student2@place.com',
                password: 'student123',
                role: 'student',
                activated: true
            };
            teacher = {
                username: 'teacher',
                email: 'teach@place.com',
                password: 'teacher123',
                role: 'teacher',
                activated: true
            };
            Promise.fulfilled().then(function() {
                return [
                    Group.create({}),
                    User.create(teacher),
                    User.create(student),
                    User.create(student2),
                    Challenge.create({
                        exp: 4,
                    }),
                    Challenge.create({
                        exp: 4,
                    })
                ];
            }).spread(function(g, t, st, st2, ch1, ch2) {
                group = g;
                teacher = t;
                student = st;
                student2 = st2;
                challenge = ch1;
                challenge2 = ch2;
            }).finally(done);
        });
        afterEach(setup.clearDB);

    it('should get by id', function (done) {
        Group.getById(group.id).then(function (group) {
            should.exist(group);
            done();
        });
    });
    it('should throw 404 using getById_404', function (done) {
        Group.getById_404(student.id).catch(function (err) {
            err.http_code.should.equal(404);
            done();
        });
    });
    it('should add student to a group using join', function (done) {
        group.join(student).then(function (member) {
            student.id.should.equal(member.user.toString());
            group.members.length.should.equal(1);
            student.memberships.length.should.equal(1);
            member.role.should.equal('subscriber');
            // member.isActive.should.equal(false);
            // member.status.should.equal('new');
            done();
        });
    });
    it('should add teacher to a group using join', function (done) {
        group.join(teacher).then(function (member) {
            teacher.id.should.equal(member.user.toString());
            group.members.length.should.equal(1);
            teacher.memberships.length.should.equal(1);
            member.role.should.equal('leader');
            member.isActive.should.equal(true);
            member.status.should.equal('current');
            done();
        });
    });

    it('should return group with members', function (done) {
        group.join(teacher).then(function (member) {
            return group.join(student);
        }).then(function () {
            return Group.getWithMembers(group.id);
        }).spread(function (group, members) {
            should.exist(members);
            members.length.should.equal(2);
            done();
        });
    });

    it('should get if member', function (done) {
        group.join(teacher).then(function (member) {
            return group.join(student);
        }).then(function () {
            return group.getIfMember(student);
        }).then(function (member) {
            should.exist(member);
            student._id.should.eql(member.user);
            done();
        });
    });

    it('should get memebr without throwing 404', function (done) {
        group.join(teacher).then(function (member) {
            return group.join(student);
        }).then(function () {
            return group.getMember_404(student.id);
        }).then(function (member) {
            should.exist(member);
            student._id.should.eql(member.user);
            done();
        });
    });

    it('should throw 404 if no member', function (done) {
        group.getMember_404(student.id).catch(function (err) {
            should.exist(err.http_code);
            done();
        });
    });

    it('should not be able to update', function (done) {
        group.join(student).then(function () {
            return group.canUpdate(student);
        }).catch(function (err) {
            should.exist(err.http_code);
            done();
        });
    });

    it('should be able to update', function (done) {
        group.join(teacher).then(function () {
            return group.canUpdate(teacher);
        }).then(function (member) {
            should.exist(member);
            teacher._id.should.eql(member.user);
            done();
        }).catch(done);
    });

    it('should create by name', function (done) {
        var name = "hello"+" "+_.random();
        Group.findOrCreateByName(name).then(function (group) {
            should.exist(group);
            group.name.should.equal(name);
            done();
        });
    });

    it('should find by name', function (done) {
        var name = "hello"+" "+_.random();
        Group.findOrCreateByName(name).then(function (group) {
            should.exist(group);
            var id = group.id;
            Group.findOrCreateByName(name).then(function (group) {
                should.exist(group);
                group.id.should.equal(id);
            });
            done();
        });
    });
    it('should add user by id', function (done) {
        group.addMember(student.id).then(function (member) {
            should.exist(member);
            done();
        });
    });
    it('should staticly add user by id', function (done) {
        Group.addMember(group.id, student.id).spread(function (group, member) {
            should.exist(group);
            should.exist(member);
            done();
        });
    });

    it('should add multiple users by id', function (done) {
        group.addMembers([student.id, teacher.id]).then(function (members) {
            should.exist(members);
            done();
        });
    });
    it('should staticly add multiple users by id', function (done) {
        Group.addMembers(group.id, [student.id, teacher.id]).spread(function (group, members) {
            should.exist(group);
            should.exist(members);
            members.length.should.equal(2);
            done();
        });
    });
    
    it('should update exp when trial is complete', function(done) {

            var times = 0;
            observer.many('user.awarded', 2,function(user, type, value) {
                times++;
                // console.log('assigned user exp ', user.exp, ' after adding ', value);
                if (times === 2) {
                    user.exp.should.equal(challenge.exp + challenge2.exp);
                    done();
                }
            });
            Promise.fulfilled().then(function() {
                return [
                    Trial.create({
                        challenge: challenge.id,
                        user: student.id,
                        complete: true
                    }),
                    Trial.create({
                        challenge: challenge2.id,
                        user: student.id,
                        complete: true
                    })
                ];
            });
        });

});