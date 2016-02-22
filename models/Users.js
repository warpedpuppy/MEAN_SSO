/**
 * Created by edwardwalther on 2/6/16.
 */
var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
    username: {type: String, lowercase: true, unique: true},
    email:String,
    hash: String,
    salt: String,
    approval_link:String,
    approval_expiration:Number,
    reset_key:String,
    reset_expiration:Number,
    enabled:{type: Boolean, default:false}
});

UserSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');

    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

    return this.hash === hash;
};

UserSchema.methods.generateJWT = function() {

    // set expiration to 60 days
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign({
        _id: this._id,
        username: this.username,
        exp: parseInt(exp.getTime() / 1000)
    }, process.env.SECRET_VAR);
};

mongoose.model('User', UserSchema);