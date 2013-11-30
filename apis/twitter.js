/**
 * Fetch selected Twitter statistics with twit module
 *
 * Jan Pieter Waagmeester <jieter@jieter.nl>
 */

var Twit = require('twit');
var T = new Twit(require('./twitter-api-auth.js'));

var cache = require('./cache.js')('__facebook-cache.json');

function twitterUser(name, callback) {
	if (cache.has(name)) {
		callback(null, cache.get(name));
	}
	T.get('users/show', { screen_name: name },  function (err, reply) {
		if (err) {
			callback(err);
			return;
		}
		cache.put(name, reply);
		callback(null, reply);
	});
}

function twitterMetrics(name, callback) {
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

module.exports.saveCache = function () {
	cache.save();
};
module.exports.clearCache = function () {
	cache.clear();
};


module.exports = twitterMetrics;