var debug = require('debug')('lifesaver');
var middleware = [];

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
});


module.exports = function(req, res) {
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
};
