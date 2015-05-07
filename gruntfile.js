module.exports = function (grunt) {

	grunt.initConfig({
		
		// Remove Unused CSS
		uncss: {
			dist: {
				files: [
				{ src: 'index.html', dest: 'css/style-clean.css' }
				]
			}
		},

		// Inline Critical CSS
		critical: {
			dist: {
				options: {
					base: './',
					minify: true,
					dimensions: [{
						width: 1300,
						height: 900
					},
					{
						width: 320,
						height: 500
					}]
				},
				files: [
				{src: ['index-critical.html'], dest: 'after.html'}
				]
			}
		},

		// Create mobile images
		responsive_images: {
			myTask: {
				options: {
					engine: "im",
					sizes: [{
						name: "mobile",
						width: 131,
						height: 131,
						quality: 80
					}]
				},
				files: [{
					expand: true,
					src: ['img/**.{jpg,gif,png}'],
					cwd: './',
					dest: './'
				}]
			}
		},

		// Minify HTML
		htmlmin: {                            
		    dist: {                                 
		      options: {                              
		        removeComments: true,
		        collapseWhitespace: true
		      },
		      files: {                  
		        'after.html': 'after.html'
		      }
		    }
		  }

	});

    // Load the plugins
    grunt.loadNpmTasks('grunt-uncss');
    grunt.loadNpmTasks('grunt-critical');
    grunt.loadNpmTasks('grunt-responsive-images');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');

    // Default tasks.
    grunt.registerTask('default', ['uncss', 'critical', 'responsive_images', 'htmlmin']);
};
