/**
 * Fetch selected Facebook statistics for profile/group/page url
 * from the Facebook graph API
 *
 * Jan Pieter Waagmeester <jieter@jieter.nl>
 */

var request = require('request');

var cache = require('./cache.js')('__facebook-cache.json');

function cachedGraphRequest(graphUrl, callback) {
	if (cache.has(graphUrl)) {
		callback(null, cache.get(graphUrl));
	} else {
		request({
			url: graphUrl,
			json: true
		}, function (err, response, body) {
			if (err && response.statusCode !== 200) {
				callback(err);
			} else {
				cache.put(graphUrl, body);
				callback(null, body);
			}
		});
	}
}


function facebookMetrics (url, callback) {
	var parts = url.split('/').filter(function (item) {
		return item !== '';
	});

	var graphUrl = 'http://graph.facebook.com/' + parts[parts.length - 1];

	cachedGraphRequest(graphUrl, function (err, result) {
		if (err) {
			return callback(err);
		}

		var data = {
			graphUrl: graphUrl
		};

		[
			'id',
			'likes',
			'talking_about_count',
			'were_here_count',
			'checkins',
			'location'
		].forEach(function (key) {
			if (result[key]) {
				data[key] = result[key];
			}
		});

		if (result['website']) {
			if (result['website'].indexOf('http://') !== 0) {
				var websiteParts = result['website'].split(' ')[0];
				// TODO fix blunt assumption here
				result['website'] = 'http://' + result['website'].split(' ')[0];
			}
			data.website = result['website'];
		}

		callback(null, data);
	});
}

module.exports = facebookMetrics;

module.exports.saveCache = function () {
	cache.save();
};
module.exports.clearCache = function () {
	cache.clear();
};

// Simple testing...
if (require.main === module) {
	var urls = 'https://www.facebook.com/DoorBrekers,https://www.facebook.com/pages/Vineyard-Amsterdam/128574734098,https://www.facebook.com/GKvGorinchem,https://www.facebook.com/pages/Kerk-van-de-Nazarener-Amersfoort/122890037726628,https://www.facebook.com/comezelhem,https://www.facebook.com/groups/148502305195044/'.split(',');

	urls.forEach(function (item) {
		facebookMetrics(item, function (err, result) {
			console.log(err, result);
		});
	});
}