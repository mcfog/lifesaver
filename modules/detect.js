var Promise = require('bluebird');

var Detector = (function(parent) {
    function Detector () {

    }
    var proto = Detector.prototype = Object.create(parent.prototype);
    proto.constructor = Detector;

    proto.detect = function() {
        var self = this;
        return Promise.cast(this._detect.apply(this, arguments))
            .then(function(result) {
                if(result !== true) {
                    self.emit('fail', result);
                }
            })
            .catch(function(e) {
                self.emit('fail', e);
            })
        ;
    };

    proto._detect = function() {
        throw new Error('unimplemented');
    };

    return Detector;
})(require('eventemitter2').EventEmitter2);

module.exports = Detector;
