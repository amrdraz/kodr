#Kodr

Kodr is an online gamified learning system that teaches programing concepts. It does so through engaging students in challenges.

Supported Challenges
coding challanges (Javascript and [Java](https://github.com/amrdraz/java-code-runner)), evaluated using bdd styled tests, tho the JS support grew week since the course focused on Java.

Users learn by partaking in challenges and following Quests which gives them experience, awarding them achivements.
Achievements showcase what the student learned and can be used to guide his learning process.

###Install

This project requires nodejs, bower, grunt, mongodb, redis and java8 and ant to run

You need to supply an SMTP mailerver configuration (see config test) we use haraka in production but you can use anything.

You can get mongodb via brew if you are a mac user otherwise for linux follow the instruction on mongdb
Download redis and intall it (used by socket.io and by express-session)

To run this project clone it locally then run `npm install`
this should install all dependencies (expet for the ones mentioned)

to run the project you need to run `mongod --bdpath ./data` in ther terminal (make sure you create the directory first) unless you're runining it as a service then it's fine

open another terminal tab and run `grunt serve` hwich launches the project in development mode

if you visit `/seed_db` it will populate the db with some test data

>As a side note I use bycript not node-bycrypt for the user hasing which may have a windows bug, but I don't care :P .
