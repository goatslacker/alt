var browserify = require('browserify')
var source = require('vinyl-source-stream')
var derequire = require('gulp-derequire')

var gulp = require('gulp')

gulp.task('default', function () {
  return browserify({ entries: './fux.js', standalone: 'Fux' })
    .transform('esnext')
    .bundle()
    .pipe(source('fux.js'))
    .pipe(derequire())
    .pipe(gulp.dest('./dist'))
})
