var gulp = require('gulp');
var coffee = require('gulp-coffee');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var flatten = require('gulp-flatten');
var browserSync = require('browser-sync');
var templateCache = require('gulp-angular-templatecache');

gulp.task('coffee', function(cb) {
    gulp.src('./src/**/*.coffee')
        .pipe(coffee({bare: true}).on('error', gutil.log))
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./tmp/'));
    cb();
});

gulp.task('template', function(cb) {
    gulp.src('./src/**/*.html')
        .pipe(templateCache({standalone: true, module: 'sessionTemplates'}))
        .pipe(gulp.dest('./tmp/'));
    cb();
});

gulp.task('copy', ['coffee', 'template'], function(cb) {
    gulp.src('./tmp/*.js')
        .pipe(concat('xp-module-session.js'))
        .pipe(gulp.dest('./dist/'));
    cb();
});

gulp.task('serve', ['build'], function(cb) {
    console.log('111');
    browserSync.init({
        server: {
            baseDir: ['./example', './']
        }
    });
    cb();
});

gulp.task('build', ['coffee', 'template', 'copy'])
