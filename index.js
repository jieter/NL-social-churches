/**
 * Fetch selected social media statistics for a list of Dutch churches.
 *
 * Jan Pieter Waagmeester <jieter@jieter.nl>
 */

var fs = require('fs');
var async = require('async');

var twitter = require('./apis/twitter.js');
var facebook = require('./apis/facebook.js');

var skipTwitter = false;
var skipFacebook = false;

// counts for reporting
var twitterCount = 0;
var facebookCount = 0;

function addTwitterMetrics(list, callback) {
	if (skipTwitter) {
		callback(null, list);
		return;
	}
	async.map(list, function (item, itemDone) {
		if(!item['twitter_name'] && item['twitter_name'] === '') {
			itemDone(null, item);
			return;
		}

		twitter(item['twitter_name'].substr(1), function (err, reply) {
			item['twitter'] = reply;

			twitterCount++;
			itemDone(err, item);
		});
	}, callback);
}

function addFacebookMetrics(list, callback) {
	if (skipFacebook) {
		callback(null, list);
		return;
	}

	async.map(list, function (item, itemDone) {
		if(!item['facebook_url'] && item['facebook_url'] === '') {
			itemDone(null, item);
			return;
		}
		facebook(item['facebook_url'], function (err, reply) {
			item['facebook'] = reply;

			// copy website from facebook profile if not already in item.
			if (item['facebook']['website'] !== '' && !item['website']) {
				item['website'] = item['facebook']['website'];
			}

			facebookCount++;
			itemDone(err, item);
		});
	}, callback);
}

var path = __dirname + '/data/';
var srcFilename = path + 'nl-churches.json';
var dstFilename = path + 'nl-churches-with-metrics.json';

if (process.argv[2] && process.argv[2] === 'clean') {
	var json = JSON.parse(fs.readFileSync(srcFilename));
	fs.writeFileSync(
		srcFilename,
		JSON.stringify(json, null, '\t')
	);

	console.log('Cleaned up ' + srcFilename);
	console.log();
}

async.waterfall([
	function loadChurches(callback) {
		var src = dstFilename;

		// do update normally, but total reload if requested.
		if (process.argv[2] && process.argv[2] === 'reload') {
			src = srcFilename;
		}
		console.log('Load churches from ' + src);

		var list = JSON.parse(fs.readFileSync(src));
		list = list.filter(function (item) {
			return item['name'] !== '';
		});
		callback(null, list);
	},
	addTwitterMetrics,
	addFacebookMetrics,
], function tasksDone(err, result) {

	if (err) {
		console.error(err);
		return;
	}

	// save the caches.
	facebook.saveCache();
	twitter.saveCache();

	var jsonString = JSON.stringify(result, null, '\t');
	fs.writeFileSync(dstFilename, jsonString);

	console.log('Wrote %d churches to %s:', result.length, dstFilename);
	console.log('      %d with Twitter metrics,', twitterCount);
	console.log('      %d with Facebook metrics', facebookCount);

});