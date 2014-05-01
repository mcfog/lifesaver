#!/usr/bin/env node
var fs = require('fs');
var Promise = require('bluebird');
var config = require('../lib/config');


config.loadDefault().then(function() {	
	console.log(JSON.stringify(config));
});
