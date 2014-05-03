var fs = require('fs');
var Promise = require('bluebird');
var p = Promise.promisify;
var debug = require('debug')('lifesaver:verbose');

var config = module.exports = Object.create({
	mergeFile: function(path) {
		var self = this;
		return p(fs.stat)(path)
			.then(function(stat) {
				if(!stat.isFile()) {
					return false;
				}
				return p(fs.readFile)(path);
			})
			.then(function(content) {
				return JSON.parse(content.toString());
			})
			.then(function(config) {
				Object.keys(config).forEach(function(k) {
					self[k] = config[k];
				});

				debug('config.mergeFile %s', path);

				return true;
			})
			.catch(function(any) {
				debug('[failed] config.mergeFile %s. %s', path, any);
				return false;
			})
			.return(self)
		;
	},
	loadDefault: function() {
		var configPath = [];
		//configPath.push(__dirname + '/../config.json');
		if(process.env.HOME) {
			configPath.push(process.env.HOME + '/.lifesaverrc');
		}

		if(process.env.LIFESAVER_CONFIG) {
			configPath.push(process.env.LIFESAVER_CONFIG);
		}

		var promise = Promise.all(configPath.map(this.mergeFile.bind(this)));

		this.loadDefault = function() {
			return promise;
		};

		return promise;
	}
});

config.workspace = process.env.HOME + '/.lifesaver';
config.encoding = 'utf8';
