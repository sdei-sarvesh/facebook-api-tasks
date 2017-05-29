// app/routes.js
var UsersModel = require('./models/user');
var Page = require('./models/pages');
var Post = require('./models/posts');
var Comment = require('./models/comments');
var Keyword = require('./models/keywords');
var async = require("async");
// load the auth variables
var configAuth = require('../config/auth');

module.exports = function (app, passport) {
    app.get('/', function (req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });


    app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'public_profile, publish_actions, publish_pages, email, manage_pages, user_photos, business_management, user_friends' }));


    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/profile',
            failureRedirect: '/'
        }));


    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile.ejs', {
            user: req.user // get the user out of session and pass to template
        });
    });

    app.get('/addkeyword/:id', function (req, res) {
        res.render('addkeyword.ejs', {
            fbId: req.params.id // get the user out of session and pass to template
        });
    });

    app.post('/savekeyword/:id', function (req, res) {
        console.log(req.params.id);
        var str = req.body.keyword;
        var temp = new Array();
        temp = str.split(",");

        async.series([//you can use "async.series" as well            
            function (callback) {
                temp.forEach(function (res) {
                    if (res != '') {
                        console.log(res);
                        var newKeyword = new Keyword();
                        newKeyword.fbId = req.params.id; // set the facebook page                   
                        newKeyword.keyword = res; // Set keyword
                        // save our user to the database
                        newKeyword.save(function (err) {
                            if (err) {
                                console.log('err');
                            } else {
                                console.log('success');
                            }
                        });
                    }

                });
                callback();
            },
        ], function (err) {
            if (err) {
                res.render('addedKeyword.ejs', {
                    fbId: req.params.id // get the user out of session and pass to template
                });
            } else {
                res.render('addedKeyword.ejs', {
                    fbId: req.params.id // get the user out of session and pass to template
                });
            }
        });
    });


    //Get User Fan Page list based on user account id
    app.get('/getFanPage/:id', function (req, res) {
        var fanPageLists = {};
        var keywords = {};
        async.series([//you can use "async.series" as well
            function (callback) {
                //get access token
                Keyword.find({ 'fbId': req.params.id }, { keyword: 1 }, function (err, keyword) {
                    if (err) {
                        callback(err);
                    } else {
                        console.log(keyword);

                        keywords = keyword;
                        callback();
                    }
                });
            },
            function (callback) {
                var graph = require('fbgraph');
                UsersModel.findOne({ 'facebook.id': req.params.id }, function (err, users) {
                    if (err) {
                        callback(err);
                    } else {
                        //console.log(users);
                        var tokan = users.facebook.token;
                        //var tokan = 'EAACS0WyXCp4BANmH9ditFMnyqlN3UuqGtxvxAOnOhJhxOwZAnxKUZA5UeIg8KDmdZC0HaqyTmXBihbvi00nOto8yye5tLD6kXJZBj8g3uMXf5ZAabgWf5mZA0ZAqa9j255LAExILZBQyWZCqedCNN1UfXKBiB7k0cbWgZD';
                        //console.log(tokan)
                        graph.get("me/accounts?access_token=" + tokan, function (err, resAccount) {
                            // returns the post id
                            //console.log('resAccount', resAccount); // { id: xxxxx}
                            var fbaccount = resAccount.data;
                            fbaccount.forEach(function (res) {
                                Page.find({ fbPageId: res.id }, function (err, pages) {
                                    if (err) {
                                        console.log('err');
                                    } else {
                                        if (!pages.length > 0) {
                                            graph.extendAccessToken({
                                                "access_token": res.access_token
                                                , "client_id": configAuth.facebookAuth.clientID
                                                , "client_secret": configAuth.facebookAuth.clientSecret
                                            }, function (err, facebookRes) {
                                                //console.log('facebookRes===', facebookRes);
                                                var newPage = new Page();
                                                newPage.fbPages = res.name; // set the facebook page                   
                                                newPage.fbPageId = res.id; // Set facebook page id                    
                                                newPage.access_token = facebookRes.access_token; // Set facebook page id                    
                                                newPage.category = res.category; // Set facebook page id                    
                                                newPage.fbId = req.params.id;
                                                // save our user to the database
                                                newPage.save(function (err) {
                                                    if (err) {
                                                        console.log(err)
                                                    } else {
                                                        console.log('success');
                                                    }
                                                });
                                            })
                                        }
                                    }
                                });
                            });
                            callback();
                        });
                    }

                });
            },
            function (callback) {
                Page.find({ fbId: req.params.id }, function (err, pages) {
                    if (err) {
                        callback(err);
                    } else {
                        fanPageLists.pages = pages;
                        callback();
                    }
                });
            },
        ], function (err) {
            if (err) {
                res.render('fbpages.ejs', {
                    pages: 'Fanpages not found',
                    userId: req.params.id, // get the user out of session and pass to template
                    keywords: keywords
                });
            } else {
                if (fanPageLists.pages.length > 0) {
                    res.render('fbpages.ejs', {
                        pages: fanPageLists.pages,
                        userId: req.params.id, // get the user out of session and pass to template
                        keywords: keywords
                    });
                } else {
                    Page.find({ fbId: req.params.id }, function (err, pages) {
                        if (err) {
                            callback(err);
                        } else {
                            res.render('fbpages.ejs', {
                                pages: pages,
                                userId: req.params.id, // get the user out of session and pass to template
                                keywords: keywords
                            });
                        }
                    });
                }
            }
        });
    });


    //Get User Fan Page all comments list and delete comment based on given static keyword
    app.get('/removeFanPageComments/:id/:userId', function (req, res) {
        var graph = require('fbgraph');
        var fanPageLists = {};
        var user_access_token;
        var page_access_token;
        var keywords = {};
        async.series([//you can use "async.series" as well
            function (callback) {
                //get access token
                Keyword.find({ 'fbId': req.params.userId }, { keyword: 1 }, function (err, userKeyword) {
                    if (err) {
                        callback(err);
                    } else {
                        //console.log(userKeyword);
                        keywords = userKeyword;
                        callback();
                    }
                });

            },
            function (callback) {
                //get access token
                UsersModel.findOne({ 'facebook.id': req.params.userId }, function (err, users) {
                    if (err) {
                        callback(err);
                    } else {
                        user_access_token = users.facebook.token;
                        callback();
                    }
                });

            },
            function (callback) {
                //get access token
                Page.findOne({ 'fbPageId': req.params.id }, function (err, pages) {
                    if (err) {
                        callback(err);
                    } else {
                        page_access_token = pages.access_token;
                        callback();
                    }
                });

            },
            function (callback) {
                //get fan page posts
                graph.get(req.params.id + "/feed?access_token=" + user_access_token, function (err, posts) {
                    if (fbpost.length > 0) {
                        var fbpost = posts.data;
                        if (fbpost.length > 0) {
                            fbpost.forEach(function (res) {
                                Post.find({ postId: res.id }, function (err, postRecord) {
                                    if (err) {
                                        console.log('err');
                                    } else {
                                        if (!postRecord.length > 0) {
                                            var newPost = new Post();
                                            newPost.fbPageId = req.params.id;
                                            newPost.post = res.message; // set the facebook page                   
                                            newPost.postId = res.id; // Set facebook page id 
                                            newPost.created_time = res.created_time; // Set facebook page id                   

                                            // save our user to the database
                                            newPost.save(function (err) {
                                                if (err) {
                                                    //console.log(err)
                                                } else {
                                                    //console.log('success');
                                                }
                                            });
                                        }
                                    }
                                });
                            });
                        }
                    }
                    callback();
                });
            },
            function (callback) {
                Post.find({ fbPageId: req.params.id }, { postId: 1 }, function (err, postIdArray) {
                    if (err) {
                        callback(err);
                    } else {
                        postId = postIdArray;
                        callback();
                    }
                });
            },
            function (callback) {
                console.log(page_access_token);
                if (postId.length > 0) {
                    postId.forEach(function (res) {
                        graph.get(res.postId + "/comments?access_token=" + user_access_token, function (err, comments) {
                            // returns the post id
                            if (comments.data) {
                                var fbpostComment = comments.data;
                                //console.log(fbpostComment);
                                if (fbpostComment) {
                                    fbpostComment.forEach(function (res) {
                                        var string1 = res.message;
                                        var string = string1.toLowerCase();
                                        if (keywords.length > 0) {
                                            keywords.forEach(function (keyword) {
                                                var userKey = keyword.keyword;
                                                var keywordString = userKey.toLowerCase();
                                                var regex = new RegExp(keywordString.trim(), 'gi');
                                                if (regex.test(string)) {
                                                    console.log('Matched==>', string);
                                                    graph.del(res.id + "?access_token=" + page_access_token, function (err, res) {
                                                        console.log(res); // {data:true}/{data:false} 
                                                    });
                                                } else {
                                                    console.log('Not matched==>', string);
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    });
                }
                callback();
            },
        ], function (err) {
            if (err) {
                res.render('successpage.ejs', {
                    pages: 'Something went wrong. Please try again.', // get the user out of session and pass to template
                    fbId: req.params.userId
                });
            } else {
                res.render('successpage.ejs', {
                    pages: 'Comments has been deleted based on given keyword. Please login to your fb account and go to particular fan page to check removed comments.', // get the user out of session and pass to template
                    fbId: req.params.userId
                });
            }
        });
    });



}
// route middleware to make sure
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}


//auto schedular script run to remove comments from fanpages 
function autoRemoveComments() {
    var keywords = {};
    Page.find({}, function (err, pages) {
        if (err) {
            console.log('err');
        } else {
            if (pages.length > 0) {
                pages.forEach(function (res) {
                    var graph = require('fbgraph');
                    var page_access_token = res.access_token;
                    var pageId = res.fbPageId;
                    var userFbId = res.fbId;
                    var fanPageLists = {};
                    var user_access_token;
                    var page_access_token;
                    var keywords = {};
                    async.series([//you can use "async.series" as well
                        function (callback) {
                            //get access token
                            Keyword.find({ 'fbId': userFbId }, { keyword: 1 }, function (err, userKeyword) {
                                if (err) {
                                    callback(err);
                                } else {
                                    //console.log(userKeyword);
                                    keywords = userKeyword;
                                    callback();
                                }
                            });

                        },
                        function (callback) {
                            //get access token
                            UsersModel.findOne({ 'facebook.id': userFbId }, function (err, users) {
                                if (err) {
                                    callback(err);
                                } else {
                                    user_access_token = users.facebook.token;
                                    callback();
                                }
                            });

                        },
                        function (callback) {
                            //get fan page posts
                            graph.get(pageId + "/feed?access_token=" + user_access_token, function (err, posts) {
                                if (posts.data) {
                                    var fbpost = posts.data;
                                    if (fbpost.length > 0) {
                                        fbpost.forEach(function (res) {
                                            Post.find({ postId: res.id }, function (err, postRecord) {
                                                if (err) {
                                                    console.log('err');
                                                } else {
                                                    if (!postRecord.length > 0) {
                                                        var newPost = new Post();
                                                        newPost.fbPageId = req.params.id;
                                                        newPost.post = res.message; // set the facebook page                   
                                                        newPost.postId = res.id; // Set facebook page id 
                                                        newPost.created_time = res.created_time; // Set facebook page id                   

                                                        // save our user to the database
                                                        newPost.save(function (err) {
                                                            if (err) {
                                                                //console.log(err)
                                                            } else {
                                                                //console.log('success');
                                                            }
                                                        });
                                                    }
                                                }
                                            });
                                        });
                                    }
                                }
                                callback();
                            });
                        },
                        function (callback) {
                            Post.find({ fbPageId: pageId }, { postId: 1 }, function (err, postIdArray) {
                                if (err) {
                                    callback(err);
                                } else {
                                    postId = postIdArray;
                                    callback();
                                }
                            });
                        },
                        function (callback) {
                            if (postId.length > 0) {
                                postId.forEach(function (res) {
                                    graph.get(res.postId + "/comments?access_token=" + user_access_token, function (err, comments) {
                                        // returns the post id
                                        if (comments.data) {
                                            var fbpostComment = comments.data;
                                            //console.log(fbpostComment);
                                            if (fbpostComment) {
                                                fbpostComment.forEach(function (res) {
                                                    var string1 = res.message;
                                                    var string = string1.toLowerCase();
                                                    if (keywords.length > 0) {
                                                        keywords.forEach(function (keyword) {
                                                            var userKey = keyword.keyword;
                                                            var keywordString = userKey.toLowerCase();
                                                            var regex = new RegExp(keywordString.trim(), 'gi');
                                                            if (regex.test(string)) {
                                                                console.log('Matched==>', string);
                                                                graph.del(res.id + "?access_token=" + page_access_token, function (err, res) {
                                                                    console.log(res); // {data:true}/{data:false} 
                                                                });
                                                            } else {
                                                                console.log('Not matched==>', string);
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        }
                                    });
                                });
                            }
                            callback();
                        },
                    ], function (err) {
                        if (err) {
                            console.log('Something went wrong. Please try again.');
                        } else {
                            console.log('Comments has been deleted based on given keyword. Please login to your fb account and go to particular fan page to check removed comments.');
                        }
                    });
                });
            }
        }
    });
}


setInterval(autoRemoveComments, 60 * 1000);
