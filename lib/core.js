var glob = require('glob');
var Promise = require('bluebird');

var debug = require('debug')('lifesaver');
var middleware = [];
var daemons = {};

middleware.push(function(req, res, next) {
	debug(['incoming', req.method, req.url].join(' '));
	next();
});

middleware.push(function(req, res, next) {
	if(req.method !== 'HEAD') {
		return next();
	}

	res.end('ok');
});

middleware.push(function(req, res, next) {
	if(req.method !== 'POST' || req.url !== '/cron' ) {
		return next();
	}

	res.end('ok');

	Object.keys(daemons).forEach(function(name) {
		daemons[name].detector.detect();
	});
});

middleware.push(function(req, res, next) {
	var match = req.url.match(/^\/daemon(\/.+)$/);
	if(req.method !== 'PUT' || !match ) {
		return next();
	}

	var path = match[1];
	if(daemons[path]) {
		res.statusCode = 403;
		res.end('exist');
	}

	addDaemon(path)
		.then(function() {
			res.end('ok');
		})
		.catch(function(e) {
			debug('daemon %s faild to boot. %s', path, e + (e.stack || ''));
			res.statusCode = 500;
			res.end(e && e.message);
		})
		.done();
});


module.exports = function(config) {
	var root = config.daemon_path || (config.workspace + '/daemon');
	var files = glob.sync(root + '/**/*.saver.js');

	return Promise.all(files.map(addDaemon)).return(handler);

	function handler(req, res) {
		var idx = 0;
		function next() {
			if(!middleware[idx]) {
				res.statusCode = 404;
				res.end('Not Found.');
				return;
			}

			middleware[idx++](req, res, next);
		}

		next();
	}
};


function addDaemon(path) {
	debug('trying to add new daemon %s', path);
	var saver = require(path);
	daemons[saver.name] = saver(require('../'));

	return Promise.cast(daemons[saver.name].main.boot())
		.then(function() {
			debug('daemon %s booted', path);
			return true;
		});
}
