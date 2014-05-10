#!/usr/bin/env node

var http = require('http');
var fs = require('fs');
var net = require('net');

var mkdirp = require('mkdirp');
var Promise = require('bluebird');

var config = require('../lib/config');
var core = require('../lib/core');

function p(obj, method) {
    method = method ? obj[method].bind(obj) : obj;

    return Promise.promisify(method);
}

function noop() {}

var coreSockPath, debugSockPath;

config.loadDefault()
    .then(function() {
        coreSockPath = config.workspace + '/run/core.sock';
        debugSockPath = config.workspace + '/run/debug.sock';

        return p(mkdirp)(config.workspace + '/run', 0755).catch(noop);
    })
    .then(function() {
        var unlink = p(fs, 'unlink');
        return Promise.join(
            unlink(coreSockPath),
            unlink(debugSockPath)
        ).catch(noop);
    })
    .then(function() {
        var sockets = [];
        hook_stdout(function(msg) {
            sockets.forEach(function(socket) {
                socket.write(msg);
            });
        });

        var server = net.createServer(function(socket) {
            sockets.push(socket);
            socket.on('end', function() {
                var idx = sockets.indeOf(socket);
                if(-1 === idx) return;
                sockets.splice(idx, 1);
            });
        });

        return p(server, 'listen')(debugSockPath);
    })
    .then(function() {
        return core(config);
    })
    .then(function(handler) {
        var server = http.createServer(handler);

        return p(server, 'listen')(coreSockPath);
    })
    .then(function() {
        return p(fs, 'chmod')(coreSockPath, 0777);
    })
    .done()
;

function hook_stdout(callback) {
    var old_write = process.stdout.write;

    process.stdout.write = (function (write) {
        return function (string, encoding, fd) {
            write.apply(process.stdout, arguments);
            callback(string, encoding, fd)
        }
    })(process.stdout.write);

    return function () {
        process.stdout.write = old_write;
    }
}
