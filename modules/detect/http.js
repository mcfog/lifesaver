var request = require('request');
var Promise = require('bluebird');

var HttpDetect = (function(parent) {
    function HttpDetect (option, checker) {
        this.option = option;
        this.checker = checker || function() {
            return true;
        };

        parent.apply(this, arguments);
    }
    var proto = HttpDetect.prototype = Object.create(parent.prototype);

    proto._detect = function() {
        var self = this;
        return Promise.promisify(request)(self.option)
            .then(this.checker.bind(this))
    };


    return HttpDetect;
})(require('../detect'));

module.exports = HttpDetect;
