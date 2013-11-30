/**
 * Fetch selected Facebook statistics for profile/group/page url
 * from the Facebook graph API
 *
 * Jan Pieter Waagmeester <jieter@jieter.nl>
 */
var request = require('request');

function facebookMetrics (url, callback) {
	var parts = url.split('/').filter(function (item) {
		return item !== '';
	});

	var graphUrl = 'http://graph.facebook.com/' + parts[parts.length - 1];

	request({
		url: graphUrl,
		json: true
	}, function (err, response, body) {
		if (err && response.statusCode !== 200) {
			callback(err);
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
			if (body[key]) {
				data[key] = body[key];
			}
		});

		if (body['website']) {
			if (body['website'].indexOf('http://') !== 0) {
				var websiteParts = body['website'].split(' ')[0];
				// TODO fix blunt assumption here
				body['website'] = 'http://' + body['website'].split(' ')[0];
			}
			data.website = body['website'];
		}

		callback(null, data);
	});
}

module.exports = facebookMetrics;

// Simple testing...
if (require.main === module) {
	var urls = 'https://www.facebook.com/DoorBrekers,https://www.facebook.com/pages/Vineyard-Amsterdam/128574734098,https://www.facebook.com/GKvGorinchem,https://www.facebook.com/pages/Kerk-van-de-Nazarener-Amersfoort/122890037726628,https://www.facebook.com/comezelhem,https://www.facebook.com/groups/148502305195044/'.split(',');


	urls.forEach(function (item) {
		facebookMetrics(item, function (err, result) {
			console.log(err, result);
		});
	});
}