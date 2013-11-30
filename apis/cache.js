/*
 * cache API request replies in JSON file.
 *
 * Jan Pieter Waagmeester <jieter@jieter.nl>
 */

var fs = require('fs');

function Cache (filename) {

	this.filename = filename;
	this._cache = fs.exists(filename) ? JSON.parse(fs.readFileSync(filename)) : {};

	this.put = function (key, obj) {
		this._cache[key] = obj;
	};

	this.clear = function () {
		this._cache = {};
	};

	this.has = function (key) {
		return key in this._cache;
	};

	this.get = function (key) {
		return this._cache[key];
	};

	this.save = function () {
		fs.writeFileSync(this.filename, JSON.stringify(this._cache));
	}
}

module.exports = function (filename) {
	return new Cache(__dirname + '/' + filename);
};