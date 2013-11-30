/**
 * Fetch selected Twitter statistics with twit module
 *
 * Jan Pieter Waagmeester <jieter@jieter.nl>
 */

var Twit = require('twit');
var T = new Twit(require('./twitter-api-auth.js'));

var cache = {};

function twitterUser(name, callback) {
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
	twitterUser(name, function (err, reply) {
		if (err) {
			return callback(err);
		}

		var data = {};

		[
			'statuses_count',
			'followers_count',
			'friends_count'
		].forEach(function (key) {
			if (reply[key]) {
				data[key] = reply[key];
			}
		});

		callback(null, data);
	});
};
