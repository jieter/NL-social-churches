/**
 * Fetch selected social media statistics for a list of Dutch churches.
 *
 * Jan Pieter Waagmeester <jieter@jieter.nl>
 */

'use strict';

var pathPrefix = __dirname + '/data/';
var srcFilename =

require('./social-church/index.js')({
		skip: {
			twitter: false,
			facebook: false
		},
		src: pathPrefix + 'nl-churches.json',
		remoteSrc: 'http://jieter.nl/NL-social-churches/nl-churches.json',
		dst: pathPrefix + 'nl-churches-with-metrics.json',
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
	}
);