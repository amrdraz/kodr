var app = require('./back/app');
var mongoose = require('mongoose');

// conect to db ===============================================================
var configDB = require('./back/config/db.js');
mongoose.connect(configDB.url);
mongoose.connection.on('error', function() {
    console.log('← MongoDB Connection Error →');
});

app.listen(app.get('port'), function() {
    console.log('Express server running on port ' + app.get('port'));
});