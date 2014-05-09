#!/usr/bin/env node
var fs = require('fs');
var Promise = require('bluebird');
var prequest = Promise.promisify(require('request'));
var config = require('../lib/config');
var debug = require('debug')('lifesaver');

config.loadDefault()
    .then(function() {
        var path = config.workspace + '/run/core.sock';
        debug('cron request post to %s', path);
        return prequest({
            socketPath: path,
            uri: 'http://lifesaver.localhost/cron',
            method: 'POST',
            timeout: 5000
        });
    })
    .error(function(e) {
        debug('daemon down, rebooting daemon...([%s]%s)', e.name, e.message);

        // fork and exit
        require('child_process').fork(__dirname + '/daemon');
        process.exit(0);
    })
    .done()
;
