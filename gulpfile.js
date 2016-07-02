var gulp = require('gulp');
var minify = require('gulp-minify');
var rename = require('gulp-rename');
var packageInfo = require('./package.json');

gulp.task('compress', function() {
  gulp.src('src/docs-plugin.js')
    .pipe(minify({noSource: true, preserveComments: 'some'}))
    .pipe(rename('brandai-docs-plugin-' + packageInfo.version + '.min.js'))
    .pipe(gulp.dest('dist'))
});