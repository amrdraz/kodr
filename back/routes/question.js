var Promise = require('bluebird');
var Question = require('../models/question');
var ExpiringToken = require('../models/expiringToken');
var access = require('./access');
var observer = require('../observer');
var ObjectId = require('mongoose').Schema.Types.ObjectId;

module.exports = function(app, passport) {

  /**
   * Find Question by id.
   *
   * @param {string} id
   * @returns {object} Question
   */

  app.get('/api/questions/:id', function(req, res, next) {
      Question
        .findOne(req.params.id)
        .select('')
        .exec(function (err, model) {
          if (err) return next(err);
          if(!model) return res.send(404,"Not Found");
          res.json({
              question: model
          });
      });
  });

  /**
   * get all questions.
   *
   * @param
   * @returns {object} questions
   */

  app.get('/api/questions', function(req, res, next) {
      Question.find(req.query)
          .select('')
          .exec()
          .then(function(model) {
            if (!model) return res.send(404, "Not Found");
            res.json({
                question: model
            });
      }, next);
  });

  /**
   * Create new question.
   *
   * @param range
   * @returns {object} question
   */

  app.post('/api/questions', access.requireRole(), function(req, res, next) {
      var question = req.body.question;
      question.author = question.user || req.user.id;
      question.created_at = question.updated_at = new Date();
      question = new Question(question);
      question.save(function(err,model) {
          if(err)
            next(err);
          res.json({
            question: model
          });
      });
  });

  app.get('/api/questions/:id/vote',access.requireRole(),function(req, res, next) {
    Question.findById(req.params.id, function(err, question) {
      if (err)
          next(err);
      else if (!question)
        return next(new Error('Could find the Question'));
      else {
        var vote = question.votesUp.indexOf(req.user.id)!=-1?1:question.votesDown.indexOf(req.user.id)!=-1?-1:0;
        res.json({
          vote: vote
        });
      }
    });
  });
  /**
   * Vote up a Question.
   *
   * @param
   * @returns {object} totalVotes
   */

  app.post('/api/questions/:id/voteUp', access.requireRole(), function(req, res, next) {
    Question.findById(req.params.id, function(err, question) {
      if (!question)
        return next(new Error('Could find the Question'));
      else {
        var len = question.votesUp.length;
        question.votesUp.remove(req.user.id);
        question.votesDown.remove(req.user.id);
        if(len === question.votesUp.length){
            question.votesUp.push(req.user.id);
        }
        question.totalVotes = question.votesUp.length - question.votesDown.length;
        question.save(function(err,model) {
          if (err)
            next(err);
          res.json({
            model: model
          });
        });
      }
    });
  });

  /**
   * Vote down a Question.
   *
   * @param
   * @returns {object} totalVotes
   */

  app.post('/api/questions/:id/voteDown', access.requireRole(), function(req, res, next) {
    Question.findById(req.params.id, function(err, question) {
      if (!question)
        return next(new Error('Could find the Question'));
      else {
        var len = question.votesDown.length;
        question.votesUp.remove(req.user.id);
        question.votesDown.remove(req.user.id);
        if(len === question.votesDown.length){
            question.votesDown.push(req.user.id);
        }
        question.totalVotes = question.votesUp.length - question.votesDown.length;
        question.save(function(err,model) {
          if (err)
            next(err);
          res.json({
            model: model
          });
        });
      }
    });
  });

  /**
   * Update an existing question.
   *
   * @param question id
   * @returns {object} question
   */

  app.put('/api/questions/:id', access.requireRole(), function(req, res, next) {
    Question.findById(req.params.id, function(err, question) {
      if (!question)
        return next(new Error('Could find the Question'));
      else {
        if(req.user._id.toString()===question.author.toString()){
            //User is the owner of the question, set updated_at
            question.set(req.body.question);
            question.updated_at = new Date();
            question.save(function(err,model) {
              if (err)
                next(err);
              res.json({
                question: model
              });
            });
        } else {
            // Unauthorized
            return res.send(401, "Unauthorized");
        }
      }
    });
  });

  /**
   * Delete an existing question.
   *
   * @param   question id
   * @returns {object} question
   */

  app.delete('/api/questions/:id', access.requireRole(), function(req, res, next) {
    Question.findById(req.params.id, function(err, question) {
      if (!question)
        return next(new Error('Could find the Question'));
      else {
        if(req.user._id.toString()===question.author.toString()){
            question.remove(function(err) {
              if (err)
                return next(err);
              res.send(204)
            });
        } else {
            return res.send(401, "Unauthorized");
        }
      }
    });
  });
};
