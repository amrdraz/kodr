process.env.NODE_ENV = 'production';

var app = require('./back/app');

app.listen(app.get('port'), function() {
    console.log('Express server running on port ' + app.get('port'));
});