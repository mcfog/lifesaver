var fluently = require('fluently');


var builder = (function b(base, name) {
	//a quick dirty factory
	var glob = require('glob');

	var path = require('path').join(base, name);;
	var constructor = require(path);

	var factory = function(a,b,c,d,e,f,g,h) {
		return new constructor(a,b,c,d,e,f,g,h);
	};

	var filelist = glob.sync(path + '/*.js')

	filelist.forEach(function(file) {
		var child = file.slice(base.length + name.length + 2, -3);
		factory[child] = b(path, child)
	});

	return factory;

}).bind(null, __dirname + '/modules');



var $S = module.exports = fluently()
	.defineObj({
		detect: builder('detect'),
		main: builder('main'),
		createDaemon: builder('daemon'),
		config: require('./lib/config')
	})

	.getTarget();


$S.config.loadDefault().then(function() {
	$S.createDaemon().define;

	// var hDetect = module.exports.detect.http({
	// 					uri: 'unix://' + module.exports.config.workspace + '/core.sock',
	// 					method: 'HEAD'
	// 				});

	// var main = module.exports.main.shell(__dirname + '/bin/daemon.js');

	// main.boot();
}).done();