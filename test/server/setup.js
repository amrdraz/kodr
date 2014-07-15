var mongoose = require('mongoose');
var config = require('../../back/config/tests');

process.env.NODE_ENV = 'test';


before(function (done) {

 function clearDB() {
   for (var i in mongoose.connection.collections) {
     mongoose.connection.collections[i].remove(function() {});
   }
   return done();
 }

 if (mongoose.connection.readyState === 0) {
   mongoose.connect(config.db.url, function (err) {
     if (err) {
       throw err;
     }
     return clearDB();
   });
 } else {
   return clearDB();
 }
});

after(function (done) {
 mongoose.disconnect();
 return done();
});

module.exports = {
  clearDB: function(done) {
   for (var i in mongoose.connection.collections) {
     mongoose.connection.collections[i].remove(function() {});
   }
   return done();
 }
};