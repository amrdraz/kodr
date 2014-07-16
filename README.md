#Kodr

Kodr is an online gamified learning system that teaches programing concepts. It does so through engaging students in challenges.

Supported Challenges
coding challanges, evaluated using bdd styled mocha with chai tests along with static structure evaluation

Users learn by partaking in challenges which gives them experience, awarding them achivements.
Achivments showcase what the student learned and can be used to guide his learning process.

###Install

This project requires nodejs, bower, grunt, mongodb to run

You can get mongodb via brew if you are a mac user

To run this project clone it locally then run `npm install`
this shoudl install all dependencies

to run the project you need to run `mongod --bdpath ./data` in ther terminal
open another terminal tab and run `grunt serve`

>As a side note I use bycript not node-bycrypt for the user hasing which may have a windows bug.

###Immidiate Road Map

- do Trial Model (an instance of a challenges with respect to a User (optional) )
- Integrate Trials with Challenges

- do backend of trials
- do Achivment Model

- do User Model with respect to Trials and Challanges
- do User access/privllage mangment
- do User mentoring, tracking.