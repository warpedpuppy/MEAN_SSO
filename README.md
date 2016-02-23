********************
Welcome!  This is very much a work in progress.

features:
1) login, registration, forgot password, change email, change password
2) Upon registration, link sent via email to confirm registration
2) Configurable expiration for that registration link
3) Angular form validation including check if username exists
4) jquery validation checks
5) Forgot password  sends reset link to user's email address
6) Reset password page
7) Configurable expiration for reset password page
8) Admin section with change email & password
9) and I'm sure others that I'm not thinking of right now. . .


to be added:
1) captcha
2) customized security features -- gettin' creative with it
3) extremely cool other stuff





HOW TO USE:

//FIRST, SET THE ENVIRONMENT VARIABLE

I believe the process for setting an environment variable varies (variable varies?) from system to system.  So visit Mr. Google.  Then you'll need to put the name of this environment variable in /config/config.json

//SECOND, FILL OUT THE CONFIG.JSON

This authentication uses email to confirm the registration and in case the user forgets their password, so the config file requires the email info.

The "expiration_choices" item in the config file just shows you what choices you have for the "authentication_expiration" (which is the time period in which the user has to confirm their registration) and the "reset_password_expiration" (which is the time period in which the token for resetting the password will last).

//THIRD START MONGO

//FOURTH TYPE IN "NPM START" FROM A TERMINAL WINDOW FROM THE ROOT DIRECTORY

//FIFTH GO TO localhost:3000 IN A BROWSER WINDOW





