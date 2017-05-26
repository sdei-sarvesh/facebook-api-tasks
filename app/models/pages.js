// app/models/pages.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var pagesSchema = mongoose.Schema({
    fbPages:String,
    fbPageId:String,
    access_token:String,
    category:String,
    fbId: String
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Page', pagesSchema);
