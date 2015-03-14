// Generated on <%= (new Date).toISOString().split('T')[0] %> using <%= pkg.name %> <%= pkg.version %>
'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  //ref: refs/heads/daily/0.0.1
  var gitVersion = (grunt.file.exists('.git/HEAD') && grunt.file.read('.git/HEAD')) || '0.0.1';

  // Configurable paths for the application
  var appConfig = {
    cdnPrefix: '//g.alicdn.com/',
    group: 'o2o',
    appName: '<%= appname %>',
    version: gitVersion.substring(gitVersion.lastIndexOf('/')+1).replace(/^\s+|\s+$/g, ''),
    app: require('./bower.json').appPath || 'app',
    dist: 'build',

    publishFiles: '*.html',
    awpConfig: {
      group: 'o2o',
      appName: '<%= appname %>',
      version: gitVersion.substring(gitVersion.lastIndexOf('/')+1).replace(/^\s+|\s+$/g, ''),
      dWebappId: 567,
      oWebappId: 251,
      oWebappDir: ''
    }
  };

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: appConfig,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: [
          '<%%= yeoman.app %>/pages/{,*/}*.js',
          '<%%= yeoman.app %>/mods/{,*/}*.js'
        ],
        tasks: ['newer:jshint:all'],
        options: {
          livereload: '<%%= connect.options.livereload %>'
        }
      },
      less: {
        files: [
          '<%%= yeoman.app %>/pages/{,*/}*.less',
          '<%%= yeoman.app %>/mods/{,*/}*.less'
        ],
        tasks: ['less:server'],
        options: {
          livereload: '<%%= connect.options.livereload %>'
        }
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%%= connect.options.livereload %>'
        },
        files: [
          './htmls/{,*/}*.html'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'local.waptest.taobao.com',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          middleware: function (connect) {
            return [
              connect.static('.tmp'), //css加载到访问路径
              connect().use(
                '/htmls',
                connect.static('./htmls') //页面加载到访问路径
              ),
              connect().use(
                '/bower_components',
                connect.static(appConfig.app + '/bower_components') //组件加载到访问路径
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          middleware: function (connect) {
            return [
              connect().use(
                '/htmls',
                connect.static('./htmls-dist') //组件页面加载到访问路径
              ),
              connect().use(
                '/pages',
                connect.static(appConfig.dist) //JS加载到访问路径
              ),
              connect.static(appConfig.dist)
            ];
          }
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%%= yeoman.app %>/pages/{,*/}*.js',
          '<%%= yeoman.app %>/mods/{,*/}*.js'
        ]
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%%= yeoman.dist %>/{,*/}*',
            '!<%%= yeoman.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },

    // Copies files
    copy: {
      pages: {
        expand: true,
        cwd: './htmls',
        dest: './htmls-dist',
        src: '*.html'
      }
    },

    // Compiles less to CSS and generates necessary files if requested
    less: {
      server: {
        files: [{
          expand: true,
          cwd: '<%%= yeoman.app %>/pages',
          src: ['**/*.less'],
          dest: '.tmp/',
          ext: '.css'
        }]
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%%= yeoman.app %>/pages',
          src: ['**/*.less'],
          dest: '.tmp/',
          ext: '.css'
        }],
        options: {
          yuicompress: true
        }
      }
    },

    //seajs模块打包合并
    transport: {
      pagejs: {
        files: [{
          expand: true,
          cwd: '<%%= yeoman.app %>/',
          src: [
            'pages/**/*.js',
            'mods/**/*.js',
            'bower_components/admix-ui/build/**/*.js'],
          dest: '.tmp/script1/'
        }]
      }
    },

    concat: {
      js: {
        options: {
          include: 'relative',
        },
        files: [{
          expand: true,
          cwd: '.tmp/script1/',
          src: 'pages/**/*.js',
          filter: function(filepath) {
            return !/-debug\.js$/.test(filepath);
          },
          dest: '.tmp/script2/'
        }]
      },
      //库文件合并 This is the same as grunt-contrib-concat
      zepto: {
        options: {
          noncmd: true
        },
        files: {
          '.tmp/script1/zepto.js': [
            '<%%= yeoman.app %>/bower_components/zepto/src/zepto.js',
            '<%%= yeoman.app %>/bower_components/zepto/src/selector.js',
            '<%%= yeoman.app %>/bower_components/zepto/src/event.js',
            '<%%= yeoman.app %>/bower_components/zepto/src/touch.js',
            '<%%= yeoman.app %>/bower_components/zepto/src/fx.js'
          ]
        }
      },
      jslib: {
        options: {
          noncmd: true
        },
        files: {
          '<%%= yeoman.dist %>/admix.js': [
            '.tmp/script2/zepto.js',
            '<%%= yeoman.app %>/bower_components/seajs/dist/sea.js'
          ]
        }
      }
    },

    //js 压缩
    uglify: {
      options: {
        mangle: true
      },
      js: {
        files: [
          {
            expand: true,
            cwd: '.tmp/script2/pages/',
            src: '{,*/}*.js',
            dest: '<%%= yeoman.dist %>/'
          }
        ]
      },
      zepto: {
        src : '.tmp/script1/zepto.js',
        dest: '.tmp/script2/zepto.js'
      }
    },

    // Performs rewrites and the useminPrepare configuration
    usemin: {
      html: ['./htmls-dist/*.html'],
      options: {
        blockReplacements: {
          css: function (block) {
            var path = appConfig.cdnPrefix + appConfig.group + '/' + appConfig.appName + '/' + appConfig.version;
            return '<link rel="stylesheet" href="'+path+block.dest+'">';
          },
          js: function(block){
            var path = appConfig.cdnPrefix + appConfig.group + '/' + appConfig.appName + '/' + appConfig.version;
            return '<script src="'+path+block.dest+'"></script>';
          }
        }
      }
    },

    // minify css, and generate to build dir
    cssmin: {
      minify: {
        expand: true,
        cwd: '.tmp/',
        src: ['{,*/}*.css'],
        dest: '<%%= yeoman.dist %>',
        ext: '.css'
      }
    },

    // replace seajs config path
    replace: {
      cdnpath:{
        src: ['./htmls-dist/{,*/}*.html'],
        overwrite: true,
        replacements: [{
          from: '{version}',
          to: function(){
            return appConfig.version;
          }
        }]
      },
      //fix zepto touch event at android 4.4
      touch : {
        src: ['.tmp/script1/zepto.js'],
        overwrite: true,
        replacements: [{
          from: 'deltaY += Math.abs(touch.y1 - touch.y2)',
          to: function(){
            return 'deltaY += Math.abs(touch.y1 - touch.y2); if (window.navigator.userAgent.indexOf("Android")>-1 && touch.x2 && Math.abs(touch.x1 - touch.x2) > 10){e.preventDefault();}';
          }
        }]
      },
      jspath:{
        src: ['<%%= yeoman.dist %>/{,*/}*.js'],
        overwrite: true,
        replacements: [{
          from: '../../',
          to: ''
        },{
          from: 'pages/',
          to: ''
        },{
          from: './mods',
          to: function(matchedWord, index, fullText, regexMatches){
            var p = fullText.indexOf('/'),
                t = fullText.substring(8, p);
            return t + '/mods';
          }
        }]
      }
    },

    //publish htmls to awp
    awp: {
      daily: {
        options: {
          awpConfig: appConfig.awpConfig,
          env: 'daily'
        },
        files: [{
          src: './htmls-dist/*.html',
          filter: function(filepath) {
            if(appConfig.publishFiles != '*.html'){
              return 'htmls-dist/' + appConfig.publishFiles == filepath;
            }
            return filepath;
          }
        }]
      },
      prepub: {
        options: {
          awpConfig: appConfig.awpConfig,
          env: 'prepub'
        },
        files: [{
          src: './htmls-dist/*.html',
          filter: function(filepath) {
            if(appConfig.publishFiles != '*.html'){
              return 'htmls-dist/' + appConfig.publishFiles == filepath;
            }
            return filepath;
          }
        }]
      },
      online: {
        options: {
          awpConfig: appConfig.awpConfig,
          env: 'online'
        },
        files: [{
          src: './htmls-dist/*.html',
          filter: function(filepath) {
            if(appConfig.publishFiles != '*.html'){
              return 'htmls-dist/' + appConfig.publishFiles == filepath;
            }
            return filepath;
          }
        }]
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: ['less:server'],
      dist: ['less:dist']
    },

    // generator index.html
    genindex : {
      options: {
        'target': '.tmp'
      },
      files: ['./htmls/*.html']
    }

  });


  grunt.registerTask('serve', [
    'clean:server',
    'concurrent:server',
    'genindex',
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'copy:pages',
    'concurrent:dist',
    'cssmin',
    'transport',
    'concat:js',
    'concat:zepto',
    'replace:touch',
    'uglify',
    'concat:jslib',
    'usemin',
    'replace:cdnpath',
    'replace:jspath'
  ]);

  grunt.registerTask('publish', 'publish htmls to awp', function (target, files) {
    if (files) {
      appConfig.publishFiles = files;
    }

    if (target === 'p') { //预发
      appConfig.cdnPrefix = '//g.assets.daily.taobao.net/';
      return grunt.task.run(['build', 'awp:prepub']);
    }
    else if (target === 'o') { //线上
      appConfig.cdnPrefix = '//g.alicdn.com/';
      return grunt.task.run(['build', 'awp:online']);
    }
    else { //日常
      appConfig.cdnPrefix = '//g.assets.daily.taobao.net/';
      return grunt.task.run(['build', 'awp:daily']);
    }

  });

  grunt.registerTask('default', [
    'newer:jshint',
    'serve'
  ]);
};
