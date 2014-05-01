module.exports = function($S) {

	return $S.createDaemon()
		.define
			.name('lifesaver.core')
			.detector(
				$S.detect.http({
					socketPath: $S.config.workspace + '/core.sock',
					method: 'HEAD'
				})
			)
			.main(
				$S.main.shell(__dirname + '/bin/daemon.js')
			)
			// .on('detector:down', 'boot')
			// .on('boot:fail', 'retry', {
			// 	wait: 3000,
			// 	max_tries: 10
			// })
			// .on('boot:fail', 'panic')
		.endDefine;
};
