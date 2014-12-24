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
    cdnPrefix: 'http://g.tbcdn.cn/',
    group: 'o2o',
    appName: '<%= appname %>',
    version: gitVersion.substring(gitVersion.lastIndexOf('/')+1),
    app: require('./bower.json').appPath || 'app',
    dist: 'build'
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
        files: ['<%%= yeoman.app %>/pages/{,*/}*.less'],
        tasks: ['less:server']
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
        hostname: 'localhost',
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
                connect.static('./htmls-dist') //组件页面到访问路径
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
            'bower_components/admix-ui/js/**/*.js'],
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
      jslib: {
        options: {
          noncmd: true
        },
        files: {
          '.tmp/admix.js': [
            '<%%= yeoman.app %>/bower_components/zepto/zepto.js',
            '<%%= yeoman.app %>/bower_components/seajs/dist/sea-debug.js'
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
      jslib: {
        src : '.tmp/admix.js',
        dest: '<%%= yeoman.dist %>/admix.js'
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

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: ['less:server'],
      dist: ['less:dist']
    }

  });


  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    if (target === 'daily') {
      appConfig.cdnPrefix = 'http://g.assets.daily.taobao.net/';
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'concurrent:server',
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'copy:pages',
    'concurrent:dist',
    'cssmin',
    'transport',
    'concat',
    'uglify',
    'usemin',
    'replace:cdnpath',
    'replace:jspath'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'serve'
  ]);
};
