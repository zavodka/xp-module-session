var gulp = require('gulp');
var coffee = require('gulp-coffee');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var flatten = require('gulp-flatten');
var browserSync = require('browser-sync');
var templateCache = require('gulp-angular-templatecache');
var del = require('del');
var runSequence = require('run-sequence');

gulp.task('coffee', function() {
    return gulp.src('./src/**/*.coffee')
        .pipe(coffee({bare: true}).on('error', gutil.log))
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./tmp/'));
});

gulp.task('template', function() {
    return gulp.src('./src/**/*.html')
        .pipe(templateCache({standalone: true, module: 'sessionTemplates'}))
        .pipe(gulp.dest('./tmp/'));
});

gulp.task('copy', function() {
    gulp.src('./tmp/*.js')
        .pipe(concat('xp-module-session.js'))
        .pipe(gulp.dest('./dist/'));
    return gulp.src('./src/style.scss')
        .pipe(concat('xp-module-session.scss'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('serve', ['build'], function(cb) {
    console.log('111');
    browserSync.init({
        server: {
            baseDir: ['./example', './']
        }
    });
});

gulp.task('clean', function() {
    return del([
        './tmp/',
        './dist/'
    ]);
});

gulp.task('build', function() {
    runSequence(
        'clean',
        ['coffee', 'template'],
        'copy'
    );
})
