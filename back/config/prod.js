module.exports = {
    host:'kodr.in',
    db: {
        // url:'mongodb://kodrodb:learn4ever@ds063919.mongolab.com:63919/kodr'
        // url:process.env.MONGOHQ_URL || 'mongodb://koderod:learn4ever@kahana.mongohq.com:10090/kodrod'
        url: 'localhost/prod'
    },
    port:process.env.PORT || 21634
};