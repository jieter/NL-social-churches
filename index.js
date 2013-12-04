
/**
 * Fetch selected social media statistics for a list of Dutch churches.
 *
 * Jan Pieter Waagmeester <jieter@jieter.nl>
 */

'use strict';

var fs = require('fs');
var async = require('async');


var path = __dirname + '/data/';
var srcFilename = path + 'nl-churches.json';
var dstFilename = path + 'nl-churches-with-metrics.json';

require('./social-church/index.js')({
		skip: {
			twitter: false,
			facebook: false
		},
		src: srcFilename,
		dst: dstFilename
	},
	function (err, result) {
		if (err) {
			console.error('Failed fetching metrics:\n', err);
			return;
		}

		result.log.forEach(function (l) {
			console.log(l);
		});

		console.log();
		console.log('Wrote %d churches to %s:', result.count, dstFilename);

	}
);