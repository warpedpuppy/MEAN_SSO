var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var jwt = require('express-jwt');
var nodemailer = require('nodemailer');
var auth = jwt({secret:process.env.SECRET_VAR, userProperty: 'payload'});
var crypto = require('crypto');
var env       = process.env.NODE_ENV || "development";
var config    = require(__dirname + '/../config/config.json')[env];

var expiration = {};
expiration.one_second = 1000;
expiration.one_minute = 60 * expiration.one_second;
expiration.one_hour = 60 * expiration.one_minute;
expiration.one_day = 24 * expiration.one_hour;
expiration.one_week = 7 * expiration.one_day;


/* GET home page. */
router.get('/', function(req, res, next) {

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

    res.json({success:"success"});
  });

});



router.get('/protected',auth,function(req, res, next) {

  res.json({success:"this is passed from the authenticated /protected post call"})

});

function send_email(email_address, email_text){


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
 // var random_string = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
 // var text = config.site_root+"/#/reset_password?key="+random_string;




// setup e-mail data with unicode symbols
  var mailOptions = {
    from: 'MEAN authentication 👥 <ted@warpedpuppy.com>', // sender address -will be email_address
    to: config.admin_email, // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world ?', // plaintext body
    html: '<a href="'+email_text+'">'+email_text+'</a>' // html body
  };

// send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
    if(error){
      return console.log(error);
    }
    console.log('Message sent: ' + info.response);
  });
  //end send email

}


router.get('/send_reset_link/:u', function(req, res, next) {

  var check_username = req.params.u.toLowerCase();

  var current_time = (!Date.now)?  new Date().getTime(): Date.now();
  var query = {"username": check_username};
  var random_string = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  var update = {'reset_key': random_string, reset_expiration:current_time};
  var options = {}

  console.log("is username "+check_username)
  User.findOneAndUpdate(query, update, function (err, user) {

    if(err)console.log(err)

    console.log("search results for "+check_username+" : "+user)

    if (user === null) {
      //this is the link doesn't exist
      return res.json({user_exists: false, email_sent:false})
    }
    else {

     var email_address = user.email;
      var username = user.username;
      var email_text = config.site_root+"/#/reset_password?key="+random_string+"&username="+username;
      send_email(email_address, email_text);
      return res.json({user_exists: true, email_sent:true})
    }

  });


});




router.post('/admin_change_password/',auth,function(req, res, next) {



  var username = req.body.username;
  var password = req.body.new_password_1;
  var salt = crypto.randomBytes(16).toString('hex');
  var hash = crypto.pbkdf2Sync(password, salt, 1000, 64).toString('hex');

  var query = {"username":username};
  var update = {'salt': salt, "hash":hash};



      User.findOneAndUpdate(query, update, function (err, user) {
        if (user === null) {
          //this is the link doesn't exist
          return res.json({user_exists: false, record_updated:false})
        }
        else {
          return res.json({user_exists: true, record_updated:true})
        }

      });





});


router.post('/admin_change_email/',auth,function(req, res, next) {



  var username = req.body.username;
  var email = req.body.new_email_1;
  var query = {"username":username};
  var update = {'email': email};



  User.findOneAndUpdate(query, update, function (err, user) {
    if (user === null) {
      //this is the link doesn't exist
      return res.json({user_exists: false, record_updated:false})
    }
    else {
      return res.json({user_exists: true, record_updated:true})
    }

  });





});


router.post('/reset_password/',function(req, res, next) {

 // console.log(req.body);


  //1) delete reset key
  //2)reset password
  //3) check expiration
  if(req.body.reset_key == 0){
    return res.status(400).json({message: 'invalid key'});
  }

  var username = req.body.username;
  var reset_key = req.body.reset_key;
  var password = req.body.new_password_1;
  var salt = crypto.randomBytes(16).toString('hex');
  var hash = crypto.pbkdf2Sync(password, salt, 1000, 64).toString('hex');
  var query = {"username":username, "reset_key":reset_key};
  var update = {'salt': salt, "hash":hash, "reset_key":0};



  User.findOne(query, function(err, user){

    if(err)console.log(err);


    var current_time,expired_time;

    if(user === null){
      return res.json({user_exists: false, record_updated:false, reset_expired:true})
    }
    else{
       current_time = (!Date.now)?  new Date().getTime(): Date.now();
       expired_time = current_time - user.reset_expiration;
    }

    if(expired_time < expiration.one_week){

        User.findOneAndUpdate(query, update, function (err, user) {
          if (user === null) {
            //this is the link doesn't exist
            return res.json({user_exists: false, record_updated:false, reset_expired:false})
          }
          else {
            return res.json({user_exists: true, record_updated:true, reset_expired:false})
          }

        });
      }
    else{
      //took too long
      return res.json({user_exists: false, record_updated:false, reset_expired:true})
    }

  });



/*

  var check_username = req.params.u.toLowerCase();

  var query = {"username": check_username};
  var random_string = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  var update = {'reset_key': random_string};
  var options = {}

  console.log("is username "+check_username)
  User.findOneAndUpdate(query, update, function (err, user) {

    if(err)console.log(err)

    console.log("search results for "+check_username+" : "+user)

    if (user === null) {
      //this is the link doesn't exist
      return res.json({user_exists: false, email_sent:false})
    }
    else {

      var email_address = user.email;
      var email_text = config.site_root+"/#/reset_password?key="+random_string;
      send_email(email_address, email_text);
      return res.json({user_exists: true, email_sent:true})
    }

  });
*/


});


router.get('/check_username/:u', function(req, res, next) {

  var check_username = req.params.u.toLowerCase();

  User.findOne({'username':check_username}, function(err,user){


    if(user)
      username_taken = true;
    else
      username_taken = false;

    res.json({username_taken:username_taken})

  })


});

router.post('/login', function(req, res, next){

  console.log(req.body);
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ console.log(err);return next(err); }

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


      console.log("update key: "+key+") "+user)
      if(user === null){
        //this is the link doesn't exist
        return res.json({token: [],info:user,allow:false, expired:false})
      }
      else{


        // time stamp is in milliseconds
        var time_entered = user.approval_expiration



        var current_time = (!Date.now)?  new Date().getTime(): Date.now();

        var time_elapsed = current_time - time_entered;

        if(time_elapsed > expiration[config.authentication_expiration])
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
  console.log(req.body.username)

  if(!req.body.username || !req.body.password|| !req.body.email){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  // 2x check validation -- did this locally, but let's do it remotely as well.

  //is username 1) greater than 6 letters and 2) only letters and numbers; and 3) not taken:




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
  var text = config.site_root+"/#/enable_account?key="+random_string;

// setup e-mail data with unicode symbols
  var mailOptions = {
    from: 'MEAN authentication 👥 <ted@warpedpuppy.com>', // sender address
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

  user.username = req.body.username.toLowerCase();
  user.approval_link =random_string;
  user.email = req.body.email.toLowerCase();

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
