module.exports = function (grunt) {

	grunt.initConfig({
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
		}
	})

    // Load the plugins
    grunt.loadNpmTasks('grunt-critical');
    grunt.loadNpmTasks('grunt-responsive-images');

    // Default tasks.
    grunt.registerTask('default', ['critical', 'responsive_images']);

};
