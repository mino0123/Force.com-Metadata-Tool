module.exports = function (grunt) {
    grunt.initConfig({
        jshint: {
            beforeconcat: ['src/**/*.js', '!src/intro.js', '!src/outro.js'],
            afterconcat: ['forcedotcommetadatatool.user.js'],
            gruntfile: ['Gruntfile.js']
        },
        concat: {
            options: {
                banner:
                    '// ==UserScript==\n' +
                    '// @id             ForceDotComMetadataTool\n' +
                    '// @name           ForceDotComMetadataTool\n' +
                    '// @version        0.0.1\n' +
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
            gruntfile: {
                files: [
                    'Gruntfile.js'
                ],
                tasks: ['jshint:gruntfile']
            },
            dev: {
                files: [
                    'src/**/*.js'
                ],
                tasks: ['jshint:beforeconcat', 'concat', 'jshint:afterconcat', 'copy']
            },
            test: {
                files: [
                    'src/**/*.js',
                    'test/**/*.js'
                ],
                tasks: ['mocha']
            }
        },
        mocha: {
            index: {
                src: ['test/index.html'],
                options: {
                    run: true
                }
            }
        },
        screenshot: {
            options: grunt.file.readJSON('.screenshot'),
                     //{loginUrl, username, password, targetUrl}
            dist: {
                dest: 'README.md'
            }
        },
        copy: {// copy to scriptish_scripts folder
            main: {
                files: (function () {
                    try {
                        return [grunt.file.readJSON('.copy')];
                    } catch (e) {
                        grunt.log.warn(e);
                        return [];
                    }
                }())
            }
        }
    });

    grunt.loadTasks('tasks');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-mocha');

    var defaults = ['mocha', 'jshint:beforeconcat', 'concat', 'jshint:afterconcat'];
    if (grunt.config.data.copy.main.files.length > 0) {
        defaults.push('copy');
    }
    grunt.registerTask('default', defaults);

};