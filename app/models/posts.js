// app/models/pages.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var postsSchema = mongoose.Schema({
    fbPageId:String,
    postId:String,
    post:String,
    created_time:String
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Post', postsSchema);
