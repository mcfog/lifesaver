var fluently = require('fluently');

var DaemonConfig = (function() {
	function DaemonConfig () {

	}
	var proto = DaemonConfig.prototype;

	fluently(proto)
		.tap(function(flu) {
			flu.property = function(key) {
				return this.define(key, function(value) {
					this.endDefine[key] = value;

					return this;
				});
			};
		})
		.property('name')
		.property('detector')
		.property('main')
		.define('on', function(key, evtName, handler) {
			this.endDefine[key].on(evtName, handler.bind(this.endDefine));

			return this;
		})
	;

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
