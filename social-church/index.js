/**
 * Fetch selected social media statistics for a list of Dutch churches.
 *
 * Jan Pieter Waagmeester <jieter@jieter.nl>
 */

'use strict';

var fs = require('fs');
var async = require('async');
var request = require('request');

var twitter = require('./twitter.js');
var facebook = require('./facebook.js');

module.exports = function (options, allDone) {

	var report = {
		log: [],
		dst: options.dst
	};

	async.waterfall([
		loadChurches(options, report),

		fetchNewChurches(options, report),

		cleanUpAndSave(options, report),
		filterEmpty(options, report),

		addTwitterMetrics(options, report),
		addFacebookMetrics(options, report),

	], function tasksDone(err, result) {
		if (err) {
			return allDone(err);
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
	website = website.replace(' ', '');

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

		callback(null, list);
	};
}

function fetchNewChurches(options, report) {
	return function (list, callback) {
		if (!options.remoteSrc || options.skip.remoteFetch) {
			report.log.push('Skipping remote fetching...');
			return callback(null, list);
		}

		request({
			url: options.remoteSrc,
			json: true
		}, function (err, response, body) {
			if (err || (response && response.statusCode !== 200)) {
				report.log.push('Error fetching remote ' + options.remoteSrc);
			}

			report.log.push('Analyzing ' + body.length + ' remote items: ');
			body.forEach(function (newItem) {
				var isNew = true;
				list.forEach(function (item) {
					// test equality
					var equal =
						(newItem.name === item.name) ||
						(newItem.twitter_name !== '' && newItem.twitter_name === item.twitter_name) ||
						(newItem.facebook_url !== '' && newItem.facebook_url === item.facebook_url);

					if (equal)  {
						report.log.push('Skipping record (' + newItem.name + '), already in list.');
						isNew = false;
					}
				});

				if (isNew) {
					report.log.push('Adding new remote record: ' + newItem.name);
					list.push(newItem);
				}
			});

			return callback(null, list);
		});
	};
}

function cleanUpAndSave(options, report) {
	// try to repair some common errors
	return function (list, callback) {
		list = list.map(function (item) {
			if (item.website && item.website !== '') {
				item.website = fixHttpUrl(item.website.toLowerCase());
			}
			if (item.facebook_url && item.facebook_url !== '') {
				item.facebook_url = fixHttpUrl(item.facebook_url);
			}

			if (item.twitter_name && item.twitter_name !== '') {
				var twitter_name = item.twitter_name.trim();

				if (twitter_name[0] !== '@') {
					// if we get an url, only use the last part.
					if (twitter_name.indexOf('http') == 0) {
						var parts = twitter_name.split('/').filter(function (element) {
							return element !== '';
						});
						twitter_name = parts[parts.length - 1];
					}
					item.twitter_name = '@' + twitter_name;
				}
			}

			return item;
		});

		// write repaired file to src
		fs.writeFileSync(options.src, JSON.stringify(list, null, '\t'));

		report.log.push('Cleaned up list, saved to ' + options.src);

		callback(null, list);
	};
}

function filterEmpty(options, report) {
	// make sure no empty records exist
	return function(list, callback) {
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