var net = require('net');
var Promise = require('bluebird');

var NetDetect = (function(parent) {
	function NetDetect (option) {
		this.option = option;

		parent.apply(this, arguments);
	}
	var proto = NetDetect.prototype = Object.create(parent.prototype);

	proto._detect = function() {
		var self = this;
		var conn;

		return Promise.try(function() {
			return new Promise(function(resolve, reject) {
				conn = net.connect(self.option, function() {
					resolve(true);
				});
			});
		}).finally(function() {
			if(conn) {
				conn.destroy();
			}
		});
	};


	return NetDetect;
})(require('../detect'));

module.exports = NetDetect;
