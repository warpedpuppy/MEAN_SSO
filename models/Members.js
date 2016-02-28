/**
 * Created by edwardwalther on 2/6/16.
 */
var mongoose = require('mongoose');

var MemberSchema = new mongoose.Schema({
    membername: {type: String, lowercase: true, unique: true},
    email:String,
    groupname: String

});


mongoose.model('Member', MemberSchema);