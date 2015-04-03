#!/usr/bin/env node

/**
 * Fetch selected social media statistics for a list of Dutch churches.
 *
 * Jan Pieter Waagmeester <jieter@jieter.nl>
 */

'use strict';
var path = require('path');

var pathPrefix = path.join(__dirname, '/data/');

require('./social-church/index.js')({

		// Skip certain things (for development)
		skip: {
			remoteFetch: false,
			twitter: false,
			facebook: false
		},

		// input list of churches
		src: pathPrefix + 'nl-churches.json',

		// The form posts to a PHP file at this url, this script can fetch them
		// from the JSON file produced by that.
		remoteSrc: 'http://jieter.nl/NL-social-churches/nl-churches.json',

		// output list.
		dst: pathPrefix + 'nl-churches-with-metrics.json'
	},
	function (err, result) {
		if (err) {
			console.error('Failed fetching metrics:\n', err);
		}

		result.log.forEach(function (l) {
			console.log(l);
		});

		console.log();
		console.log('Wrote %d churches to %s.', result.count, result.dst);
		console.log();
		console.log('Stats:');
		require('./social-church/stats.js')({
			filename: result.dst,
			dst: pathPrefix + 'stats.json'
		});
	}
);
