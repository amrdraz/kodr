#Kodr

Kodr is an online gamified learning system that teaches programing concepts. It does so through engaging students in challenges.

Supported Challenges
coding challanges, evaluated using bdd styled mocha with chai tests along with static structure evaluation

Users learn by partaking in challenges which gives them experience, awarding them achivements.
Achivments showcase what the student learned and can be used to guide his learning process.

###Install

This project requires nodejs, bower, grunt, mongodb, redis and java8 to run

You need to supply an SMTP mailerver configuration (see config test) we use haraka in production

You can get mongodb via brew if you are a mac user otherwise for linux follow the instruction on mongdb
Download redis and intall it (used by socket.io and by express-session)

To run this project clone it locally then run `npm install`
this should install all dependencies (expet for the ones mentioned)

to run the project you need to run `mongod --bdpath ./data` in ther terminal (make sure you create the directory first)

open another terminal tab and run `grunt serve`

>As a side note I use bycript not node-bycrypt for the user hasing which may have a windows bug.
