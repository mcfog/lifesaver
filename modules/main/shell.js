var debug = require('debug')('lifesaver');
var child_process = require('child_process');

var ShellMain = (function(parent) {
    function ShellMain (cmd, args, options) {
        this.cmd = cmd;
        this.args = args || [];
        this.options = options;

        parent.apply(this, arguments);
    }
    var proto = ShellMain.prototype = Object.create(parent.prototype);
    proto.constructor = ShellMain;

    proto.boot = function() {
        if(this.child) {
            return false;
        }

        delete this.stop;

        var shell = this;

        this.child = (function() {
            var child = child_process.spawn(shell.cmd, shell.args, shell.options);
            debug('spawn "%s %s" pid=%s', shell.cmd, shell.args.join(' '), child.pid);

            var kill = function() {
                child.kill();
            };

            process.on('exit', kill);

            child.on('exit', function(code, signal) {
                process.removeListener('exit', kill);

                debug('child %s down', child.pid);
                shell.child = null;
                shell.emit('down', code, signal);
            });

            child.stdout.on('readable', function() {
                shell.emit('log', 'info', child.stdout.read());
            });

            child.stderr.on('readable', function() {
                shell.emit('log', 'warn', child.stderr.read());
            });

            return child;
        })();
    };

    proto.stop = function() {
        this.stop = true;
        if(this.child) {
            debug('kill %s', this.child.pid);
            this.child.kill();
        }
    };


    return ShellMain;
})(require('../main'));

module.exports = ShellMain;