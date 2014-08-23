module.exports = {
    db: {
        // url:'mongodb://kodrodb:learn4ever@ds063919.mongolab.com:63919/kodr'
        url:process.env.MONGOHQ_URL || 'mongodb://kodrod:learn4ever@kahana.mongohq.com:10090/kodrod'
    },
    port:process.env.PORT || 21634
};