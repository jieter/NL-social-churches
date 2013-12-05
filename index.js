/**
 * Fetch selected social media statistics for a list of Dutch churches.
 *
 * Jan Pieter Waagmeester <jieter@jieter.nl>
 */

'use strict';

var pathPrefix = __dirname + '/data/';
var srcFilename =

require('./social-church/index.js')({

		// Bepaalde onderdelen uit de pijplijn kunnen worden
		// overgeslagen
		skip: {
			remoteFetch: false,
			twitter: false,
			facebook: false
		},

		// De lijst met kerken, facebook-urls, twitternames en websites.
		src: pathPrefix + 'nl-churches.json',

		// het webformulier post naar een php-bestandje op jieter.nl,
		// stop ze in een json bestand waar dit scriptje ze weer uit vist.
		remoteSrc: 'http://jieter.nl/NL-social-churches/nl-churches.json',

		// uiteindelijke datafile, met een gedeelte uit de responses
		// van de beide API's.
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