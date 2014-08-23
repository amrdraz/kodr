module.exports = function (env) {
    switch(env) {
    case 'production':
        return require('./prod');
    case 'test':
        return require('./tests');
    default:
        return require('./dev');
    }
};