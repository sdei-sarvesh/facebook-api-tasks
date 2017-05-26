// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {
	'facebookAuth': {
		'clientID': '161428167658142', // your App ID
		'clientSecret': '63801b3933784acc73299823eb97300a', // your App Secret
		'scope': 'public_profile, publish_actions, publish_pages, email, manage_pages, user_photos, business_management, user_friends',
		'callbackURL': 'http://fbtesttask.tk:5058/auth/facebook/callback'
	},
};