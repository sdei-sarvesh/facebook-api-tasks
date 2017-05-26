// app/models/pages.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var commentsSchema = mongoose.Schema({
    commentId:String,
    comment:String,
    created_time:String
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Comment', commentsSchema);
