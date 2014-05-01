var fluently = require('fluently');

var DaemonConfig = (function() {
	function DaemonConfig () {

	}
	var proto = DaemonConfig.prototype;

	return DaemonConfig;
})();

var Daemon = (function(parent) {
	function Daemon () {
		parent.apply(this, arguments);
	}
	var proto = Daemon.prototype = Object.create(parent.prototype);
	proto.constructor = Daemon;

	fluently(proto)
		.getterBlock('define', 'endDefine', function() {
			return new DaemonConfig(this);
		});

	return Daemon;
})(require('eventemitter2').EventEmitter2);

module.exports = Daemon;
