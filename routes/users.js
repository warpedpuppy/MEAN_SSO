var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var jwt = require('express-jwt');
var auth = jwt({secret:process.env.SECRET_VAR, userProperty: 'payload'});



/* GET users listing. */
router.get('/',function(req, res, next) {

 res.render('users')

});

router.post('/users_protected',auth,function(req, res, next) {
 //res.send('protected');
 //res.render('index');
 res.json({success:"this is passed from the authenticated /users_protected post call"})

});


module.exports = router;
