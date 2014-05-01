#!/usr/bin/env node

var http = require('http');
var fs = require('fs');

var mkdirp = require('mkdirp');
var Promise = require('bluebird');

var config = require('../lib/config');
var core = require('../lib/core');

function p(obj, method) {
	method = method ? obj[method].bind(obj) : obj;

	return Promise.promisify(method);
}

function noop() {};

var path;

config.loadDefault()
	.then(function() {
		path = config.workspace + '/core.sock';
		return p(mkdirp)(config.workspace, 0755).catch(noop);
	})
	.then(function() {
		return p(fs, 'unlink')(path).catch(noop);
	})
	.then(function() {
		var server = http.createServer(core);

		return p(server, 'listen')(path);
	})
	.then(function() {
		return p(fs, 'chmod')(path, 0777);
	})
	.done()
;
