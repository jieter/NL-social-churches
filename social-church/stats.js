var fs = require('fs');


var facebook = function (item, key) {
	if (!item['facebook'] || !item['facebook'][key]) {
		return 0;
	} else {
		return item['facebook'][key];
	}
}
var twitter = function (item, key) {
	if (!item['twitter'] || !item['twitter'][key]) {
			return 0;
	} else {
		return item['twitter'][key];
	}
}

var metrics = {
	'total': function (item) {
		return 1;
	},

	'twitter': function (item) {
		return item['twitter'] ? 1 : 0;
	},
	'facebook': function (item) {
		return item['facebook'] ? 1 : 0;
	},
	'website': function (item) {
		return item['website'] ? 1 : 0;
	},

	// facebook
	'likes': function (item) {
		return facebook(item, 'likes');
	},
	'checkins': function (item) {
		return facebook(item, 'checkins');
	},

	// twitter
	'tweets': function (item) {
		return twitter(item, 'statuses_count');
	},
	'friends': function (item) {
		return twitter(item, 'friends_count');
	},
	'followers': function (item) {
		return twitter(item, 'followers_count');
	}
};
var date = function() {
	var now = new Date();
	return now.toISOString().slice(0, 10);
};
module.exports = function (options) {
	if (options.data) {
		var data = options.data;
	} else {
		if (!fs.existsSync(options.filename)) {
			return false;
		}

		// read current data
		var data = JSON.parse(fs.readFileSync(options.filename));
	}

	// default date to todays date
	if (!options.date) {
		options.date = date()
	}

	var result = {};
	Object.keys(metrics).forEach(function (metric) {
		result[metric] = 0;
	});

	// Collect the metrics
	data.forEach(function (item) {
		for (var metric in metrics) {
			result[metric] += metrics[metric](item);
		}
	});

	console.log(result);

	if (!fs.existsSync(options.dst)) {
		var list = {};
	} else {
		var list = JSON.parse(fs.readFileSync(options.dst));
	}

	list[options.date] = result;

	var ret = {}
	Object.keys(list).sort()
		.forEach(function (k) {
			ret[k] = list[k];
		});

	fs.writeFileSync(options.dst, JSON.stringify(ret, null, 2));
};
