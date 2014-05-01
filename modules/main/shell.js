var child_process = require('child_process');

var ShellMain = (function(parent) {
	function ShellMain (cmd, args, options) {
		this.cmd = cmd;
		this.args = args;
		this.options = options;

		parent.apply(this, arguments);
	}
	var proto = ShellMain.prototype = Object.create(parent.prototype);
	proto.constructor = ShellMain;

	proto.boot = function() {
		if(this.child) {
			throw new Error('child exist');
		}

		var shell = this;

		this.child = (function() {
			var child = child_process.spawn(shell.cmd, shell.args, shell.options);

			var kill = function() {
				child.kill();
			};

			process.on('exit', kill);

			child.on('exit', function(code, signal) {
				process.removeListener('exit', kill);
				shell.child = null;
			});

			child.stdout.on('readable', function() {
				shell.emit('log:stdout', child.stdout.read());
			});

			child.stderr.on('readable', function() {
				shell.emit('log:stderr', child.stderr.read());
			});
		})();
	};

	proto.stop = function() {
		this.child || this.child.kill();
	};


	return ShellMain;
})(require('../main'));

module.exports = ShellMain;