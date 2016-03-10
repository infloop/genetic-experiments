// Include Gulp
var gulp = require('gulp');

// Include plugins
var plugins = require("gulp-load-plugins")({
    pattern: ['gulp-*', 'gulp.*', 'main-bower-files'],
    replaceString: /\bgulp[\-.]/
});

// Define default destination folder
var dest = './visualizer/public/distrib';

gulp.task('vendorjs', function() {

    var jsFiles = ['src/js/*'];

    gulp.src(plugins.mainBowerFiles().concat(jsFiles))
        .pipe(plugins.filter('**/*.js'))
        .pipe(plugins.print(function(filepath) {
            return "bower files: " + filepath;
        }))
        //.pipe(plugins.sourcemaps.init())
        .pipe(plugins.concat('vendor.js'))
        //.pipe(plugins.sourcemaps.write())
        //.pipe(plugins.uglify())
        .pipe(plugins.print(function(filepath) {
            return "compiled files: " + filepath;
        }))
        .pipe(gulp.dest(dest));

});

gulp.task('css', function() {

    var cssFiles = ['src/css/*'];

    gulp.src(plugins.mainBowerFiles().concat(cssFiles))
        .pipe(plugins.filter('*.css'))
        .pipe(plugins.concat('main.css'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(dest + 'css'));

});

gulp.task('default', ['vendorjs']);