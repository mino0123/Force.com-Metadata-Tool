'use strict';

module.exports = function (grunt) {

    var path = require('path');
    var phantomjs = require('grunt-lib-phantomjs').init(grunt);

    phantomjs.on('log', function () {
        console.log.apply(console, arguments);
    });
    phantomjs.on('fail.load', function (url) {
        grunt.verbose.write('Running PhantomJS...').or.write('...');
        grunt.warn('PhantomJS unable to load "' + url + '" URI.', 90);
    });
    phantomjs.on('fail.timeout', function () {
        grunt.log.writeln();
        grunt.warn('PhantomJS timed out.', 90);
    });
    phantomjs.on('onLoadFinished', function (status) {
        console.log('onLoadFinished: ' + status);
    });
    phantomjs.on('onUrlChanged', function (newUrl) {
        // console.log('UrlChanged: ' + newUrl);
    });
    phantomjs.on('onResourceRequested', function (url) {
        // console.log('onResourceRequested: ' + url);
    });
    phantomjs.on('error', function (err) {
        grunt.warn(err);
    });
    phantomjs.on('error.onError', function (msg, trace) {
        grunt.warn(msg);
    });

    var asset = path.join.bind(null, __dirname);

    grunt.registerTask('screenshot', 'build README.md', function () {
        var options = this.options({
                phantomScript: asset('phantomjs', 'main.js')
            }),
            done = this.async();
        phantomjs.on('console', console.log.bind(console));
        phantomjs.spawn(null, {
            options: options,
            done: function (err) {
                console.log('done.');
                phantomjs.halt();
                if (err) {
                    console.log('error.');
                    console.log(err);
                }
                done();
            }
        });
    });

};
