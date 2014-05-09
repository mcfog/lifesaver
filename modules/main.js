var Main = (function(parent) {
    function Main () {
        parent.call(this, {

        });
    }
    var proto = Main.prototype = Object.create(parent.prototype);
    proto.constructor = Main;

    proto.boot = function() {
        throw new Error('unimplemented');
    };
    proto.stop = function(arg) {
        throw new Error('unimplemented');
    };

    return Main;
})(require('eventemitter2').EventEmitter2);

module.exports = Main;
