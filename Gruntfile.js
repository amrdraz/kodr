// Generated on 2014-06-18 using generator-webapp 0.4.9
'use strict';
var path = require('path');
// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function(grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Configurable paths
    var config = {
        app: 'app',
        dist: 'dist',
        server: 'back'
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        config: config,

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            bower: {
                files: ['bower.json'],
                tasks: ['bowerInstall']
            },
            // js: {
            //     files: ['<%= config.app %>/scripts/{,*/}*.js'],
            //     tasks: ['jshint'],
            //     options: {
            //         livereload: true
            //     }
            // },
            emberTemplates: {
                files: ['<%= config.app %>/templates/{,*/}*.hbs'],
                tasks: ['emberTemplates'],
                options: {
                    livereload: true
                }
            },
            jstest: {
                files: ['test/spec/{,*/}*.js'],
                tasks: ['test:watch']
            },
            browserify: {
                files: ['<%= config.app %>/scripts/{,*,*/*}/*.js'],
                tasks: ['browserify'],
                options: {
                    spawn: false,
                    interrupt: true,
                    livereload: true
                }
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            sass: {
                files: ['<%= config.app %>/styles/{,*/}*.{scss,sass}'],
                tasks: ['sass:server', 'autoprefixer']
            },
            styles: {
                files: ['<%= config.app %>/styles/{,*/}*.css'],
                tasks: ['newer:copy:styles', 'autoprefixer']
            },
            livereload: {
                options: {
                    livereload: true
                },
                files: [
                    '!<%= config.app %>/lib',
                    '<%= config.app %>/{,*/}*.html',
                    '.tmp/styles/{,*/}*.css',
                    '<%= config.app %>/images/{,*/}*',
                    '.rebooted'
                ]
            }
        },
        express: {
            options: {
                port: 9000
            },
            dev: {
                options: {
                    script: 'server.js',
                    port: 9000,
                    node_env: 'development'
                }
            },
            prod: {
                options: {
                    script: 'server.js',
                    node_env: 'production'
                }
            },
            test: {
                options: {
                    script: 'test-server.js',
                    node_env: 'test',
                    hostname: 'localhost',
                    port: 9001
                }
            }
        },
        open: {
            server: {
                url: 'http://localhost:<%= express.options.port %>'
            }
        },
        nodemon: {
            dev: {
                script: 'server.js',
                options: {
                    watch: ['<%= config.server %>'],
                    ext: 'js,coffee,jade',
                    env: {
                        PORT: '9000',
                        NODE_ENV:'development'
                    },
                    // omit this property if you aren't serving HTML files and 
                    // don't want to open a browser tab on start
                    callback: function(nodemon) {
                        nodemon.on('log', function(event) {
                            console.log(event.colour);
                        });

                        // opens browser on initial server start
                        nodemon.on('config:update', function() {
                            // Delay before server listens on port
                            setTimeout(function() {
                                require('open')('http://localhost:9000');
                            }, 1000);
                        });

                        // refreshes browser when server reboots
                        nodemon.on('restart', function() {
                            // Delay before server listens on port
                            setTimeout(function() {
                                require('fs').writeFileSync('.rebooted', 'rebooted');
                            }, 1000);
                        });
                    }
                }
            },
            test: {
                script: 'test-server.js',
                options: {
                    watch: ['<%= config.server %>'],
                    ext: 'js,coffee,jade',
                    env: {
                        PORT: '3000',
                        NODE_ENV:'test'
                    },
                    // omit this property if you aren't serving HTML files and 
                    // don't want to open a browser tab on start
                    callback: function(nodemon) {
                        nodemon.on('log', function(event) {
                            console.log(event.colour);
                        });

                        // opens browser on initial server start
                        nodemon.on('config:update', function() {
                            // Delay before server listens on port
                            setTimeout(function() {
                                // require('open')('http://localhost:3000');
                            }, 1000);
                        });

                        // refreshes browser when server reboots
                        nodemon.on('restart', function() {
                            // Delay before server listens on port
                            setTimeout(function() {
                                require('fs').writeFileSync('.rebooted', 'rebooted');
                            }, 1000);
                        });
                    }
                }
            }
        },
        // The actual grunt server settings
        connect: {
            options: {
                port: 9000,
                open: true,
                livereload: 35729,
                // Change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function(connect) {
                        return [
                            connect.static('.tmp'),
                            connect().use('/app/lib', connect.static('./app/lib')),
                            connect.static(config.app)
                        ];
                    }
                }
            },
            test: {
                options: {
                    open: false,
                    port: 9001,
                    middleware: function(connect) {
                        return [
                            connect.static('.tmp'),
                            connect.static('test'),
                            connect().use('/app/lib', connect.static('./app/lib')),
                            connect.static(config.app)
                        ];
                    }
                }
            },
            dist: {
                options: {
                    base: '<%= config.dist %>',
                    livereload: false
                }
            }
        },

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= config.app %>/scripts/{,*/}*.js',
                '!<%= config.app %>/vendor/*',
                'test/spec/{,*/}*.js'
            ]
        },

        karma: {
            unit: {
                configFile: 'karma.conf.js',
                // autoWatch: true
                background: true
            }
        },

        // Mocha testing framework configuration options
        mocha: {
            all: {
                options: {
                    run: true,
                    urls: ['http://<%= express.test.options.hostname %>:<%= express.test.options.port %>/index.html']
                }
            }
        },


        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= config.dist %>/*',
                        '!<%= config.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },

        browserify: {
            main: {
                src: '<%= config.app %>/scripts/main.js',
                dest: '.tmp/scripts/build.js'
            },
            iframe: {
                src: '<%= config.app %>/scripts/iframe-main.js',
                dest: '.tmp/iframe/main.js'
            }
        },
        emberTemplates: {
            options: {
                templateName: function(sourceFile) {
                    var templatePath = config.app + '/templates/';
                    return sourceFile.replace(templatePath, '');
                }
            },
            dist: {
                files: {
                    '.tmp/scripts/templates.js': '<%= config.app %>/templates/**/*.hbs'
                }
            }
        },
        // Compiles Sass to CSS and generates necessary files if requested
        sass: {
            options: {
                includePaths: [
                    'app/lib'
                ]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/styles',
                    src: ['*.scss'],
                    dest: '.tmp/styles',
                    ext: '.css'
                }]
            },
            server: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/styles',
                    src: ['*.scss'],
                    dest: '.tmp/styles',
                    ext: '.css'
                }]
            }
        },

        // Add vendor prefixed styles
        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/styles/',
                    src: '{,*/}*.css',
                    dest: '.tmp/styles/'
                }]
            }
        },

        // Automatically inject Bower components into the HTML file
        bowerInstall: {
            app: {
                src: ['<%= config.app %>/index.html'],
                exclude: ['app/lib/bootstrap-sass-official/vendor/assets/javascripts/bootstrap.js']
            },
            sass: {
                src: ['<%= config.app %>/styles/{,*/}*.{scss,sass}']
            }
        },

        // Renames files for browser caching purposes
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= config.dist %>/scripts/{,*/}*.js',
                        '<%= config.dist %>/styles/{,*/}*.css',
                        '<%= config.dist %>/images/{,*/}*.*',
                        // '<%= config.dist %>/styles/fonts/{,*/}*.*',
                        '<%= config.dist %>/*.{ico,png}'
                    ]
                }
            }
        },
        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            options: {
                dest: '<%= config.dist %>'
            },
            html: '<%= config.app %>/index.html'
        },

        preprocess : {
            options: {
                inline: true,
                context : {
                    DEBUG: false
                }
            },
            html : {
                src : [
                    // '<%= config.dist %>/index.html', 
                    '<%= config.dist %>/*.html'
                ]
            },
            js : {
                src: ['.tmp/scripts/*.js', '.tmp/iframe/*.js']
            }
        },
        // Performs rewrites based on rev and the useminPrepare configuration
        usemin: {
            options: {
                assetsDirs: ['<%= config.dist %>', '<%= config.dist %>/images']
            },
            html: ['<%= config.dist %>/{,*/}*.html'],
            css: ['<%= config.dist %>/styles/{,*/}*.css']
        },

        // The following *-min tasks produce minified files in the dist folder
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/images',
                    src: '{,*/}*.{gif,jpeg,jpg,png}',
                    dest: '<%= config.dist %>/images'
                }]
            }
        },

        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= config.dist %>/images'
                }]
            }
        },

        htmlmin: {
            dist: {
                options: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeCommentsFromCDATA: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= config.dist %>',
                    src: '{,*/}*.html',
                    dest: '<%= config.dist %>'
                }]
            }
        },

        // By default, your `index.html`'s <!-- Usemin block --> will take care of
        // minification. These next options are pre-configured if you do not wish
        // to use the Usemin blocks.
        // cssmin: {
        //     dist: {
        //         files: {
        //             '<%= config.dist %>/styles/main.css': [
        //                 '.tmp/styles/{,*/}*.css',
        //                 '<%= config.app %>/styles/{,*/}*.css'
        //             ]
        //         }
        //     }
        // },
        uglify: {
            dist: {
                files: {
                    '<%= config.dist %>/ifrmae/main.js': [
                        '.tmp/iframe/main.js'
                    ]
                }
            }
        },
        // concat: {
        //     dist: {}
        // },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= config.app %>',
                    dest: '<%= config.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        'images/{,*/}*',
                        '{,*/}*.html',
                        'styles/fonts/{,*/}*.*',
                        // 'vendor/MathJax/**'
                    ]
                }, {
                    expand: true,
                    dot: true,
                    cwd: '.',
                    src: ['app/lib/bootstrap-sass-official/vendor/assets/fonts/bootstrap/*.*'],
                    dest: '<%= config.dist %>'
                },{
                    expand: true,
                    dot: true,
                    cwd:'.tmp/iframe',
                    src:['main.js'],
                    dest:'<%= config.dist %>/iframe/'
                }]
            },
            styles: {
                expand: true,
                dot: true,
                cwd: '<%= config.app %>/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            }
        },

        // Generates a custom Modernizr build that includes only the tests you
        // reference in your app
        modernizr: {
            dist: {
                devFile: 'app/lib/modernizr/modernizr.js',
                outputFile: '<%= config.dist %>/scripts/vendor/modernizr.js',
                files: {
                    src: [
                        '<%= config.dist %>/scripts/{,*/}*.js',
                        '<%= config.dist %>/styles/{,*/}*.css',
                        '!<%= config.dist %>/scripts/vendor/*'
                    ]
                },
                uglify: true
            }
        },

        // Run some tasks in parallel to speed up build process
        concurrent: {
            watch: {
                tasks: ['nodemon:dev', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            },
            watchtest: {
                tasks: ['nodemon:test', 'watch'],
                options: {
                    logConcurrentOutput: true
                }
            },
            server: [
                'sass:server',
                'browserify',
                'emberTemplates',
                'copy:styles'
            ],
            test: [

                'browserify',
                'emberTemplates',
                'copy:styles'
            ],
            dist: [
                'sass',
                'copy:styles',
                'browserify',
                'emberTemplates',
                // 'imagemin',
                'svgmin'
            ]
        }
    });


    grunt.registerTask('serve', function(target) {
        if (target === 'dist') {
            return grunt.task.run(['build']);
        }

        grunt.task.run([
            'clean:server',
            'concurrent:server',
            'autoprefixer',
            'concurrent:watch'
        ]);
    });

    grunt.registerTask('server', function(target) {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run([target ? ('serve:' + target) : 'serve']);
    });

    grunt.registerTask('test', function(target) {
        if (target !== 'watch') {
            grunt.task.run([
                'clean:server',
                'concurrent:test',
                'autoprefixer',
            ]);
        }

        grunt.task.run([
            'concurrent:watchtest'
        ]);
    });
    
    grunt.registerTask('build', [
        'clean:dist',
        'useminPrepare',
        'concurrent:dist',
        'autoprefixer',
        'concat',
        'cssmin',
        'preprocess:js',  // Remove DEBUG code from production builds
        'copy:dist',
        'uglify',
        'modernizr',
        'rev',
        'usemin',
        'htmlmin',
        'preprocess:html',  // Remove DEBUG code from production builds
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'test',
        'build'
    ]);
};
