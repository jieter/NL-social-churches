var fs = require('fs');
var async = require('async');

var twitter = require('./apis/twitter.js');


var path = __dirname + '/';

var churches = JSON.parse(fs.readFileSync(path + 'nl-churches.json'));

async.map(churches, function (item, callback) {
	console.log(item);

	if (false || item['twitter_name'] !== '') {
		twitter(item['twitter_name'].substr(1), function (err, reply) {
			item['twitter'] = reply;
			console.log(err, reply);
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
	async.map(result, function (item, callback) {
		console.log('TODO: check Facebook stuff');

		callback(null, item);
	}, function (err, result) {
		if (err) {
			console.error(err);
			return;
		}

		fs.writeFileSync(path + 'nl-churches-with-metrics.json', JSON.stringify(result, null, '\t'));
		console.log(JSON.stringify(result));
	});
});
