var glob = require('glob');
var Promise = require('bluebird');

var debug = require('debug')('lifesaver');
var middleware = [];
var daemons = {};

var Ignored = function() { };
Ignored.prototype = Object.create(Error.prototype);

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
		daemons[name].detector.detect()
			.finally(function(arg) {
				debug('detect %s finished', name);
			})
			.done()
		;
	});
});

middleware.push(function(req, res, next) {
	var match = req.url.match(/^\/daemon(\/.+)$/);
	if(req.method !== 'PUT' || !match ) {
		return next();
	}

	var path = match[1];

	addDaemon(path)
		.then(function() {
			res.end('ok');
		})
		.catch(Ignored, function() {
			res.statusCode = 403;
			res.end('exist');

			return true;
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

	return Promise
		.try(function() {
			return Promise.cast(require(path)(require('../')));
		})
		.then(function(saver) {
			
			if(daemons[saver.name]) {
				debug('daemon with name <%s> already exist. ignored', saver.name);
				throw new Ignored();
			}

			daemons[saver.name] = saver;

			return Promise.cast(daemons[saver.name].main.boot()).return(saver);
		})
		.then(function(saver) {
			debug('daemon %s booted', saver.name);
			return true;
		})
	;
}
