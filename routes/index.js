var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var jwt = require('express-jwt');
var nodemailer = require('nodemailer');
var auth = jwt({secret:process.env.SECRET_VAR, userProperty: 'payload'});

var env       = process.env.NODE_ENV || "development";
var config    = require(__dirname + '/../config/config.json')[env];

/* GET home page. */
router.get('/', function(req, res, next) {
 /* */

      User.find({}, function(err, docs) {
        if (!err){
          console.log(docs);
          //process.exit();
        } else {throw err;}
      })
  res.render('index');
});

router.post('/empty_dbs',function(req, res, next) {
  User.remove({}, function(err){
    if(err)console.log(err)

    res.json({sucess:"sucess"});
  });

});



router.get('/protected',auth,function(req, res, next) {

  res.json({success:"this is passed from the authenticated /protected post call"})

});

router.post('/check_username', function(req, res, next) {

  var check_username = req.body.username;

  User.findOne({'username':check_username}, function(err, user){
    if (err) return handleError(err);

    if(user === null)
      res.json({user:false})
    else
      res.json({user:true})
  })


});

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      if(user.enabled === false)
        return res.status(400).json({message: 'not approved yet'});
      else
        return res.json({token: user.generateJWT()});


    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

router.post('/enable_account/:key', function(req, res, next) {
    var key = req.params.key;


    var query = {"approval_link": key};
    var update = {'enabled': true, 'approval_link': 0};
    var options = {};


    User.findOneAndUpdate(query, update,  function(err, user){



      if(user === null){
        //this is the link doesn't exist
        return res.json({token: [],info:user,allow:false, expired:false})
      }
      else{


        // time stamp is in milliseconds
        var time_entered = user.approval_expiration

        var one_second = 1000;
        var one_minute = 60 * one_second;
        var one_hour = 60 * one_minute;
        var one_day = 24 * one_hour;
        var one_week = 7 * one_day;

        var current_time = (!Date.now)?  new Date().getTime(): Date.now();

        var time_elapsed = current_time - time_entered;

        if(time_elapsed > one_hour)
        {
          //delete record and tell person that it has been too long

          User.remove({"_id":user._id}, function(err){
            if(err)console.log(err)

            return res.json({token: [],info:user,allow:false, expired:true})
          });

        }
        else{

          return res.json({token: user.generateJWT(),info:user,allow:true, expired:false})

        }











      }

    })


})



router.post('/register', function(req, res, next){
  if(!req.body.username || !req.body.password|| !req.body.email){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  //send email

  //the following only works, because I downgraded the security on the following account
  //https://www.google.com/settings/security/lesssecureapps
  var smtpConfig = {
    host: config.email_host,
    port: config.email_port,
    secure: true, // use SSL
    auth: {
      user: config.email_user,
      pass: config.email_password
    }
  };

  var transporter = nodemailer.createTransport(smtpConfig);
  var random_string = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  var text = "http://localhost:3000/#/enable_account?key="+random_string;

// setup e-mail data with unicode symbols
  var mailOptions = {
    from: 'Ted Walther 👥 <ted@warpedpuppy.com>', // sender address
    to: config.admin_email, // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world ?', // plaintext body
    html: '<a href="'+text+'">'+text+'</a>' // html body
  };

// send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
  //end send email



  var user = new User();

  user.username = req.body.username;
  user.approval_link =random_string;

  user.approval_expiration = (!Date.now)?  new Date().getTime(): Date.now();

  user.setPassword(req.body.password)

  user.save(function (err){
    if(err){ return next(err); }

    //changing this -- now must click link
    //return res.json({token: user.generateJWT()})

    return res.json({approval:"pending"});
  });


});



router.post('/enabled_get_token', function(req, res, next){

  var user_id = req.body.user_id;
  var query = {"_id": user_id};


  User.find(query,  function(err, user){
    console.log(user);
    return res.json({token: user.generateJWT(),info:user})
  })




  if(!req.body.username || !req.body.password|| !req.body.email){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  //this a call to the db
  var user = new User();

  user.username = req.body.username;
  user.approval_link =random_string;

  user.setPassword(req.body.password)

  user.save(function (err){
    if(err){ return next(err); }

    //changing this -- now must click link
    //return res.json({token: user.generateJWT()})

    return res.json({approval:"pending"});
  });


});

function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}



module.exports = router;
