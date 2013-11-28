var request = require('request');

function facebookMetrics (url, callback) {
	var parts = url.split('/');
	var graphUrl = 'http://graph.facebook.com/';

	graphUrl += parts[parts.length - 1];

	request({
		url: graphUrl,
		json: true
	}, function (err, response, body) {
		if (err && response.statusCode !== 200) {
			callback(err);
		}

		var data = {
			id: body['id'],
			likes: body['likes'],
			talking_about_count: body['talking_about_count'],
			checkings: body['checkins']
		};

		if (body['website']) {
			if (body['website'].indexOf('http://') !== 0) {
				var websiteParts = body['website'].split(' ')[0];
				// blunt assumption here
				body['website'] = 'http://' + body['website'].split(' ')[0];
			}
			data.website = body['website'];

		}
		if (body['were_here_count']) {
			data['were_here_count'] = body['were_here_count'];
		}

		callback(null, data);
	});
};

module.exports = facebookMetrics;

if (require.main === module) {
	// testing it.
	var urls = 'https://www.facebook.com/DoorBrekers,https://www.facebook.com/westlandnetwerk,https://www.facebook.com/pages/Vineyard-Amsterdam/128574734098,https://www.facebook.com/GKvGorinchem,https://www.facebook.com/pages/Kerk-van-de-Nazarener-Amersfoort/122890037726628,https://www.facebook.com/comezelhem'.split(',');


	urls.forEach(function (item) {
		facebookMetrics(item, function (err, result) {
			console.log(err, result);
		});
	});
}