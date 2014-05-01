var Promise = require('bluebird');

var Detector = (function() {
	function Detector () {

	}
	var proto = Detector.prototype;
	proto.constructor = Detector;

	proto.detect = function() {
		return Promise.cast(this._detect.apply(this, arguments));
	};
	proto._detect = function() {
		throw new Error('unimplemented');
	};

	return Detector;
})();

module.exports = Detector;
