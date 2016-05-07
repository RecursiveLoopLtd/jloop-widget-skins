module.exports = function(grunt) {
  grunt.loadNpmTasks("grunt-karma");
  grunt.loadNpmTasks("grunt-contrib-sass");
  grunt.loadNpmTasks("grunt-shell");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-yuidoc");
  grunt.loadNpmTasks("grunt-browserify");

  grunt.initConfig({
    apiSrcDir: "api",
    apiBuildDir: "build/api",
    apiDistDir: "dist/api",
    apiTestDir: "api/test",
    demoSrcDir: "demo",
    demoBuildDir: "build/demo",
    demoDistDir: "dist/demo",
    pkg: grunt.file.readJSON("package.json"),
    banner: "/*!\n" +
            " * <%= pkg.name %>\n" +
            " * @author <%= pkg.author %>\n" +
            " * @version <%= pkg.version %>\n" +
            " * Copyright <%= pkg.copyright %>\n" +
            " */\n",
    shell: {
      cleanDist: {
        command: "rm -R <%= apiDistDir %>/* <%= demoDistDir %>/*"
      },
      cleanBuild: {
        command: "rm -R <%= apiBuildDir %>/* <%= demoBuildDir %>/*"
      }
    },
    sass: {
      demo: {
        options: {
          style: "expanded",
          banner: "<%= banner %>",
        },
        files: {
          "<%= demoBuildDir %>/css/styles.css": "<%= demoSrcDir %>/scss/styles.scss"
        }
      }
    },
    browserify: {
      api: {
        files: {
          "<%= apiBuildDir %>/jloop-compiled.js": [ "<%= apiSrcDir %>/js/**/*.js" ]
        },
        options: {
        }
      },
      demo: {
        files: {
          "<%= demoBuildDir %>/jloop-demo-compiled.js": [ "<%= demoSrcDir %>/js/**/*.js" ]
        },
        options: {
        }
      }
    },
    uglify: {
      api: {
        files: {
          "<%= apiBuildDir %>/jloop.min.js": ["<%= apiBuildDir %>/jloop-compiled.js"]
        }
      },
      demo: {
        files: {
          "<%= demoBuildDir %>/jloop-demo.min.js": ["<%= demoBuildDir %>/jloop-demo-compiled.js"]
        }
      }
    },
    copy: {
      demo: {
        files: [
          { expand: true, cwd: "<%= demoSrcDir %>", src: ["demo.html"], dest: "<%= demoBuildDir %>/" },
        ]
      },
    },
    jshint: {
      all: [
        "<%= apiSrcDir %>/js/**/*.js",
        "<%= apiDemoDir %>/js/**/*.js",
      ]
    },
    karma: {
      unit: {
        configFile: "<%= apiTestDir %>/karma-unit.conf.js",
        autoWatch: false,
        singleRun: true
      },
      unit_auto: {
        configFile: "<%= apiTestDir %>/karma-unit.conf.js",
        autoWatch: true,
        singleRun: false
      }
    },
    watch: {
      apiJs: {
        files: [
          "<%= apiSrcDir %>/js/**/*.js"
        ],
        tasks: ["browserify:api", "uglify:api", "docs"]
      },
      demoHtml: {
        files: [
          "<%= demoSrcDir %>/demo.html"
        ],
        tasks: ["copy:demo"]
      },
      demoJs: {
        files: [
          "<%= demoSrcDir %>/js/**/*.js"
        ],
        tasks: ["browserify:demo", "uglify:demo"]
      },
      demoScss: {
        files: [
          "<%= demoSrcDir %>/scss/**/*.scss"
        ],
        tasks: ["sass:demo"]
      }
    },
    yuidoc: {
      all: {
        name: "<%= pkg.name %>",
        description: "<%= pkg.description %>",
        version: "<%= pkg.version %>",
        url: "<%= pkg.homepage %>",
        options: {
          paths: ["<%= apiSrcDir %>/js"],
          outdir: "docs"
        }
      }
    }
  });

  grunt.registerTask("clean", ["shell"]);
  grunt.registerTask("build", ["sass", "browserify", "uglify", "copy:demo"]);
  grunt.registerTask("docs", ["yuidoc"]);
  grunt.registerTask("test", ["karma:unit_auto"]);
};
