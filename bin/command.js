#!/usr/bin/env node
var Promise = require('bluebird');
var director = require('director');
var fs = require('fs');
var cliff = require('cliff');


var prequest = Promise.promisify(require('request'));
var config = require('../lib/config');
var debug = require('debug')('lifesaver');

var router = new director.cli.Router();
router.usage = [];

router.configure({
    notfound: usage
});

router.param('path', /([^]+)/);
router.param('name', /([^]+)/);

on('list', 'show the daemon list', function () {
    return [request('get', '/daemon')];
});

on(':nameget', 'get daemon detail', function (name) {
    return [request('get', '/daemon/' + name)];
});

on(':namestop', 'stop the daemon temporaryly', function (name) {
    return [request('post', '/daemon/' + name + '/stop')];
});

on(':namestart', 'start the daemon', function (name) {
    return [request('post', '/daemon/' + name + '/start')];
});

on(':namereboot', 'reboot the daemon', function (name) {
    return [request('post', '/daemon/' + name + '/reboot')];
});

on(':nameremove', 'remove the daemon temporaryly', function (name) {
    return [request('post', '/daemon/' + name + '/remove')];
});

on('add:path', 'register a new daemon', function (path) {
    return [p(fs, 'stat')(path)
        .then(function (stat) {
            if (!stat.isFile()) {
                throw new Error(path + ' is not a valid file');
            }

            return p(fs, 'realpath')(path);
        })
        .then(function (path) {
            return request('put', '/daemon' + path);
        })
    ];
});


router.dispatch('on', process.argv.slice(2).join(''));

function usage() {
    console.log('available commands:');
    var rows = router.usage.map(function (u) {
        return [u[0].replace(//g, ' ').green, u[1]];
    });

    console.log(cliff.stringifyRows(rows));
}

function on(path, desc, cmd) {
    router.on(path, function () {
        Promise.cast(cmd.apply(this, arguments))
            .spread(function(result, cb) {
                log(result, cb);
            })
            .done();
    });
    router.usage.push([path, desc]);
}

function request(method, uri) {
    return config.loadDefault()
        .then(function () {
            var path = config.workspace + '/run/core.sock';
            debug('cron request post to %s', path);
            return prequest({
                socketPath: path,
                uri: 'http://localhost' + uri,
                method: method,
                timeout: 5000
            });
        })
        .spread(function (res) {
            if (res.statusCode !== 200) {
                var err = new Error();
                err.statusCode = res.statusCode;
                err.headers = res.headers;
                err.body = res.body;
                console.error(err);
                return Promise.reject(err);
            }

            return arguments;
        })

}

function p(obj, name) {
    return Promise.promisify(obj[name].bind(obj));
}

function log(promise, cb) {
    cb = cb ? cb : function (res) {
        return res.body;
    };
    Promise.cast(promise)
        .spread(function (res) {
            return cb(res);
        })
        .then(function (msg) {
            console.log(msg);
        })
        .error(function (e) {
            cliff.putObject(e);
        })
        .done();
}
