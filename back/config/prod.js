module.exports = {
    db: {
        // url:'mongodb://kodrodb:learn4ever@ds063919.mongolab.com:63919/kodr'
        url:process.env.MONGOHQ_URL || 'mongodb://heroku:wWMCUPbGs8YJvrZ_KlOa4XLDqahk8A-5uWsP1AphxMku6GhVIYnVDFjDjjqcBEfavLLfleBS6k9UQVg27BD2TA@kahana.mongohq.com:10025/app28810263'
    },
    port:process.env.PORT || 21634
};