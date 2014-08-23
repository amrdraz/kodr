module.exports = {
    db: {
        // url:'mongodb://kodrodb:learn4ever@ds063919.mongolab.com:63919/kodr'
        url:process.env.MONGOHQ_URL
    },
    port:process.env.PORT
};