module.exports = function (grunt) {
    grunt.initConfig({
        jshint: {
            beforeconcat: ['Gruntfile.js', 'src/**/*.js', '!src/intro.js', '!src/outro.js'],
            afterconcat: ['forcedotcommetadatatool.user.js']
        },
        concat: {
            options: {
                banner:
                    '// ==UserScript==\n' +
                    '// @id             ForceDotComMetadataTool\n' +
                    '// @name           ForceDotComMetadataTool\n' +
                    '// @version        0.0.1\n' +
                    '// @namespace      \n' +
                    '// @author         minoaw\n' +
                    '// @description    \n' +
                    '// @include        https://*.salesforce.com/*\n' +
                    '// @run-at         document-end\n' +
                    '// @require        lib/jquery-1.8.3.min.js\n' +
                    '// @require        lib/Hogan.js/hogan-2.0.0.min.js\n' +
                    '// @require        lib/JSZip/jszip.js\n' +
                    '// @require        lib/JSZip/jszip-load.js\n' +
                    '// @require        lib/JSZip/jszip-inflate.js\n' +
                    '// @require        lib/JSZip/jszip-deflate.js\n' +
                    '// @noframes       \n' +
                    '// ==/UserScript==\n\n'
            },
            dist: {
                src : [
                    'src/intro.js',
                    'src/css/*.js',
                    'src/template/init.js',
                    'src/template/*.js',
                    'src/core.js',
                    'src/data.js',
                    'src/general_table_view.js',
                    'src/tabs.js',
                    'src/describe_global.js',
                    'src/describe_sobject.js',
                    'src/describe_metadata.js',
                    'src/list_metadata.js',
                    'src/deploy_retrieve.js',
                    'src/outro.js'
                ],
                dest: 'forcedotcommetadatatool.user.js'
            }
        },
        watch: {
            all: {
                files: [
                    'Gruntfile.js',
                    'src/**/*.js'
                ],
                tasks: ['default']
            }
        },
        mocha: {
            index: {
                src: ['test/index.html'],
                options: {
                    run: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha');
    grunt.registerTask('default', ['mocha', 'jshint:beforeconcat', 'concat', 'jshint:afterconcat']);

};