var Twit = require('twit');

var T = new Twit(require('./twitter-api-auth.js'));

var cache = {};

function user(name, callback) {
	if (cache[name]) {
		callback(null, cache[name]);
	}
	T.get('users/show', { screen_name: name },  function (err, reply) {
		if (err) {
			callback(err);
			return;
		}
		cache[name] = reply;
		callback(null, reply);
	});
}

module.exports = function (name, callback) {
	user(name, function (err, reply) {
		if (err) {
			return callback(err);
		}

		callback(null, {
			tweets: reply['statuses_count'],
			followers: reply['followers_count'],
			friends: reply['friends_count']
		});
	});
};
