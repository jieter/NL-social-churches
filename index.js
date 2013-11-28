var fs = require('fs');
var async = require('async');

var twitter = require('./apis/twitter.js');
var facebook = require('./apis/facebook.js');

var path = __dirname + '/';

var skipTwitter = false;
var skipFacebook = false;

var churches = JSON.parse(fs.readFileSync(path + 'nl-churches.json'));

var twitterCount = 0;
var facebookCount = 0;

async.map(churches, function addTwitterMetrics(item, callback) {
	if (!skipTwitter && item['twitter_name'] && item['twitter_name'] !== '') {
		twitter(item['twitter_name'].substr(1), function (err, reply) {
			item['twitter'] = reply;

			twitterCount++;
			callback(err, item);
		});
	} else {
		callback(null, item);
	}
}, function (err, result) {
	if (err) {
		console.error(err);
		return;
	}

	// add facebook metrics
	async.map(result, function addFacebookMetrics(item, callback) {
		if (!skipFacebook && item['facebook_url'] && item['facebook_url'] !== '') {
			facebook(item['facebook_url'], function (err, reply) {
				item['facebook'] = reply;

				if (item['facebook']['website'] !== '' && !item['website']) {
					item['website'] = item['facebook']['website'];
				}

				facebookCount++;
				callback(err, item);
			});
		} else {
			callback(null, item);
		}
	}, function (err, result) {
		if (err) {
			console.error(err);
			return;
		}

		fs.writeFileSync(path + 'nl-churches-with-metrics.json', JSON.stringify(result, null, '\t'));

		console.log('Wrote %d churches, %d with twitter metrics, %d with facebook metrics',
			result.length, twitterCount, facebookCount);
	});
});
