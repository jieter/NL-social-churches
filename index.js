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

async.waterfall([
	function loadChurches(callback) {
		callback(null, JSON.parse(fs.readFileSync(path + 'nl-churches.json')));
	},
	addTwitterMetrics,
	addFacebookMetrics,
], function tasksDone(err, result) {

	if (err) {
		console.error(err);
		return;
	}

	var jsonString = JSON.stringify(result, null, '\t');
	var dstFilename = path + 'nl-churches-with-metrics.json';
	fs.writeFileSync(dstFilename, jsonString);

	console.log('Wrote %d churches to %s:', result.length, dstFilename);
	console.log('      %d with Twitter metrics,', twitterCount);
	console.log('      %d with Facebook metrics', facebookCount);

});