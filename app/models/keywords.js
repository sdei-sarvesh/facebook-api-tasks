// app/models/pages.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var keywordSchema = mongoose.Schema({
    fbId:String,
    keyword:String
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Keyword', keywordSchema);
