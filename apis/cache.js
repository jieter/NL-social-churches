/*
 * Simple JSON cache.
 *
 * Jan Pieter Waagmeester <jieter@jieter.nl>
 */

var fs = require('fs');

function Cache (filename, ttl) {
	this.filename = filename;

	// use 2h cache time by default.
	ttl = ttl || 2 * 60 * 60 * 1000;

	if (fs.existsSync(filename)) {
		var stat = fs.statSync(filename);

		if (stat.mtime.getTime() + ttl > (new Date()).getTime()) {
			this._cache = JSON.parse(fs.readFileSync(filename));
		} else {
			this._cache = {};
		}

	} else {
		this._cache = {};
	}

	this.put = function (key, obj) {
		this._cache[key] = obj;
	};

	this.clear = function () {
		this._cache = {};
	};

	this.has = function (key) {
		return this._cache[key] !== undefined;
	};

	this.get = function (key) {
		return this._cache[key];
	};

	this.save = function () {
		fs.writeFileSync(this.filename, JSON.stringify(this._cache));
	};
}

module.exports = function (filename) {
	return new Cache(__dirname + '/' + filename);
};