/**
 * Fetch selected Twitter statistics with twit module
 *
 * Jan Pieter Waagmeester <jieter@jieter.nl>
 */
'use strict';

var Twit = require('twit');
var T = new Twit(require('./credentials.js').twitter);

var cache = require('./cache.js')('__twitter-cache.json');

function twitterUser(name, callback) {
	if (cache.has(name)) {
		return callback(null, cache.get(name));
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
			console.log(err);
			return callback(null, {
				name: name,
				message: err.message
			});
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
}

module.exports = twitterMetrics;
module.exports.saveCache = function () {
	cache.save();
};
module.exports.clearCache = function () {
	cache.clear();
};