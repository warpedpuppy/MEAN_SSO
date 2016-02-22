

this started with this: https://thinkster.io/mean-stack-tutorial#adding-some-style

added:

1) link sent via email to confirm registration
2) expiration for that link
3) angular form validation including check if username exists
4) jquery validation checks
5) added forgot password which sends reset link to user address
6) reset password page
7) admin section with change email & password


//FIRST, SET THE ENVIRONMENT VARIABLE

Two places for the environment variables:

./routes/index.js line 7
./models/Users.js line 37

To set them (on mac osx), open a terminal window and type: export SECRET_VAR=CHOOSE_THE_VAR_VALUE_THAT_MAKES_YOU_HAPPY

To view your environment variables, just type 'export' into a terminal window

//SECOND START MONGO

//THIRD NPM START