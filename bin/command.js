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

on('list', 'show the daemon list', function() {
    request('get', '/daemon')
        .spread(function(res) {
            console.log(res.body);
        })
        .done();
});


on('add:path', 'register a new daemon', function (path) {
    p(fs, 'stat')(path)
        .then(function(stat) {
            if(!stat.isFile()) {
                throw new Error(path + ' is not a valid file');
            }

            return p(fs, 'realpath')(path);
        })
        .then(function(path) {
            return request('put', '/daemon' + path);
        })
        .spread(function(res) {
            if(res.statusCode !== 200) {
                var err = new Error();
                err.statusCode = res.statusCode;
                err.headers = res.headers;
                err.body = res.body;
                return Promise.reject(err);
            }

            console.log(res.body);
        })
        .error(function(e) {
            cliff.putObject(e);
        })
        .done();
});


router.dispatch('on', process.argv.slice(2).join(''));

function usage() {
    console.log('available commands:');
    var rows = router.usage.map(function(u) {
        return [u[0].replace(//g, ' ').green, u[1]];
    });

    console.log(cliff.stringifyRows(rows));
}

function on(path, desc, cmd) {
    router.on(path, cmd);
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
}

function p(obj, name) {
    return Promise.promisify(obj[name].bind(obj));
}
