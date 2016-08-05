module.exports = function(grunt) {
  grunt.loadNpmTasks("grunt-karma");
  grunt.loadNpmTasks("grunt-contrib-sass");
  grunt.loadNpmTasks("grunt-shell");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-yuidoc");
  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-babel");
  grunt.loadNpmTasks("grunt-browserify");

  grunt.initConfig({
    buildDir: "build",
    distDir: "dist",
    skinsSrcDir: "src",
    skinsBuildDir: "<%= buildDir %>/skins",
    skinsDistDir: "<%= distDir %>/skins",
    skinsTestDir: "src/test",
    demoSrcDir: "demo",
    demoBuildDir: "<%= buildDir %>/demo",
    demoDistDir: "<%= distDir %>/demo",
    vendorDir: "vendor",
    pkg: grunt.file.readJSON("package.json"),
    banner: "/*!\n" +
            " * <%= pkg.name %>\n" +
            " * @author <%= pkg.author %>\n" +
            " * @version <%= pkg.version %>\n" +
            " * Copyright <%= pkg.copyright %>\n" +
            " */\n",
    shell: {
      cleanDist: {
        command: "rm -R <%= distDir %>"
      },
      cleanBuild: {
        command: "rm -R <%= buildDir %>"
      }
    },
    connect: {
      server: {
        options: {
          hostname: "",
          port: 8888,
          keepalive: true,
          base: {
            path: "<%= buildDir %>",
            options: {
              index: "<%= demoSrcDir %>/demo.html"
            }
          }
        }
      }
    },
    sass: {
      skins: {
        options: {
          style: "expanded",
          banner: "<%= banner %>",
        },
        files: {
          "<%= skinsBuildDir %>/css/jloopClassic.css": "<%= skinsSrcDir %>/scss/jloopClassic.scss",
        }
      }
    },
    babel: {
      options: {
        sourceMap: true,
        presets: ["react"]
      },
      skins: {
        files: [{
          "expand": true,
          "cwd": "<%= skinsSrcDir %>/js",
          "src": "**/*.js",
          "dest": "<%= skinsBuildDir %>/tmp",
        }]
      }
    },
    browserify: {
      skins: {
        files: {
          "<%= skinsBuildDir %>/jloopClassic-compiled.js": [ "<%= skinsBuildDir %>/tmp/**/*.js" ]
        },
        options: {
        }
      },
      demo: {
        files: {
          "<%= demoBuildDir %>/jloop-demo-compiled.js": [ "<%= demoBuildDir %>/tmp/**/*.js" ]
        },
        options: {
        }
      }
    },
    uglify: {
      skins: {
        files: {
          "<%= skinsBuildDir %>/jloopClassic.min.js": ["<%= skinsBuildDir %>/jloopClassic-compiled.js"]
        }
      },
      demo: {
        files: {
          "<%= demoBuildDir %>/jloop-demo.min.js": ["<%= demoBuildDir %>/jloop-demo-compiled.js"]
        }
      }
    },
    copy: {
      skins: {
        files: [
          {
            expand: true,
            cwd: "<%= skinsSrcDir %>",
            src: [
              "img/**",
            ],
            dest: "<%= skinsBuildDir %>/"
          },
        ]
      },
      demo: {
        files: [
          {
            expand: true,
            cwd: "<%= demoSrcDir %>",
            src: [
              "demo.html",
            ],
            dest: "<%= demoBuildDir %>/"
          },
        ]
      },
      vendor: {
        files: [
          {
            expand: true,
            cwd: ".",
            src: [
              "<%= vendorDir %>/**",
            ],
            dest: "<%= buildDir %>/"
          },
        ]
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: "<%= skinsBuildDir %>",
            src: [
              "**",
              "!tmp/**"
            ],
            dest: "<%= distDir %>/"
          },
        ]
      },
    },
    jshint: {
      all: [
        "<%= skinsSrcDir %>/js/**/*.js",
        "<%= skinsDemoDir %>/js/**/*.js",
      ]
    },
    karma: {
      unit: {
        configFile: "<%= skinsTestDir %>/karma-unit.conf.js",
        autoWatch: false,
        singleRun: true
      },
      unit_auto: {
        configFile: "<%= skinsTestDir %>/karma-unit.conf.js",
        autoWatch: true,
        singleRun: false
      }
    },
    watch: {
      skinsJs: {
        files: [
          "<%= skinsSrcDir %>/js/**/*.js"
        ],
        tasks: ["buildJs"]
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
        tasks: ["buildJs"]
      },
      skinsScss: {
        files: [
          "<%= skinsSrcDir %>/scss/**/*.scss"
        ],
        tasks: ["sass:skins"]
      },
      skinsResources: {
        files: [
          "<%= skinsSrcDir %>/img/**"
        ],
        tasks: ["copy:skins"]
      }
    },
    yuidoc: {
      all: {
        name: "<%= pkg.name %>",
        description: "<%= pkg.description %>",
        version: "<%= pkg.version %>",
        url: "<%= pkg.homepage %>",
        options: {
          paths: ["<%= skinsSrcDir %>/js"],
          outdir: "docs"
        }
      }
    }
  });

  grunt.registerTask("clean", ["shell"]);
  grunt.registerTask("docs", ["yuidoc"]);
  grunt.registerTask("test", ["karma:unit_auto"]);
  grunt.registerTask("buildJs", [/*test, */"babel", "browserify", "uglify", "docs"]);
  grunt.registerTask("build", ["clean", "sass", "buildJs", "copy:skins", "copy:demo", "copy:vendor", "copy:dist"]);
  grunt.registerTask("run", ["connect:server"]);
};
