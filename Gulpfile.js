var browserify = require('browserify')
var derequire = require('gulp-derequire')
var gulp = require('gulp')
var source = require('vinyl-source-stream')
var to5ify = require("6to5ify")

gulp.task('default', function () {
  return browserify({ entries: './fux.js', standalone: 'Fux' })
    .transform(to5ify)
    .bundle()
    .pipe(source('fux.js'))
    .pipe(derequire())
    .pipe(gulp.dest('./dist'))
})
