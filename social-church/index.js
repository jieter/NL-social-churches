/**
 * Fetch selected social media statistics for a list of Dutch churches.
 *
 * Jan Pieter Waagmeester <jieter@jieter.nl>
 */

'use strict';

var fs = require('fs');
var async = require('async');

var twitter = require('./twitter.js');
var facebook = require('./facebook.js');

module.exports = function (options, allDone) {

	var report = {
		log: []
	};

	async.waterfall([
		loadChurches(options, report),
		addTwitterMetrics(options, report),
		addFacebookMetrics(options, report),

	], function tasksDone(err, result) {
		if (err) {
			return callback(err);
		}

		// save the caches.
		facebook.saveCache();
		twitter.saveCache();

		var jsonString = JSON.stringify(result, null, '\t');
		fs.writeFileSync(options.dst, jsonString);

		report.count = result.length;
		report.twitterCount = null;
		report.facebookCount = null;

		allDone(err, report);
	});
};

function fixHttpUrl(website) {
	if (!website) {
		return website;
	}

	var protocol = website.substr(0, 7);
	if (!(protocol === 'http://' || protocol === 'https:/')) {
		website = 'http://' + website;
	}

	return website;
}

function loadChurches(options, report) {
	return function (callback) {
		report.log.push('Load churches from ' + options.src);

		var list = JSON.parse(fs.readFileSync(options.src));

		// try to repair some common errors
		list = list.map(function (item) {
			if (item.website && item.website !== '') {
				item.website = fixHttpUrl(item.website.toLowerCase());
			}
			if (item.facebook_url && item.facebook_url !== '') {
				item.facebook_url = fixHttpUrl(item.facebook_url);
			}

			if (item.twitter_name && item.twitter_name !== '') {
				var twitter_name = item.twitter_name;
				if (twitter_name[0] !== '@') {
					item.twitter_name = '@' + item.twitter_name;
				}
			}

			return item;
		});

		// write repaired file to src
		fs.writeFileSync(options.src, JSON.stringify(list, null, '\t'));

		report.log.push('Cleaned up ' + options.src);

		// make sure no empty records exist
		list = list.filter(function (item) {
			return item['name'] !== '';
		});
		callback(null, list);
	};
}

function addTwitterMetrics (options, report) {
	return function (list, callback) {
		if (options.skip.twitter) {
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

				report.twitterCount++;
				itemDone(err, item);
			});
		}, callback);
	};
}

function addFacebookMetrics (options, report) {
	return function (list, callback) {
		if (options.skip.facebook) {
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

				report.facebookCount++;
				itemDone(err, item);
			});
		}, callback);
	};
}