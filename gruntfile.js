module.exports = function (grunt) {

	grunt.initConfig({
		// cssmin: {
		// 	dist: {
		// 		files: [
		// 		{ src: 'stylesheets/home.css', dest: 'stylesheets/home.min.css' }
		// 		]
		// 	}
		// },
		critical: {
			dist: {
				options: {
					base: './',
					dimensions: [{
						width: 1300,
						height: 900
					},
					{
						width: 500,
						height: 500
					}]
				},
				files: [
				{src: ['index.html'], dest: 'after.html'}
				]
			}
		}
	})

    // Load the plugins
    grunt.loadNpmTasks('grunt-critical');
    //grunt.loadNpmTasks('grunt-contrib-cssmin');

    // Default tasks.
    grunt.registerTask('default', ['critical']);

};
