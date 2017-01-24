var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var buildDebug = require('./gulpfile/gulpfile.debug')(gulp, plugins);

// build debug
gulp.task('build-debug-clean', buildDebug.clean);
gulp.task('build-debug-script', buildDebug.buildScript);
gulp.task('build-debug-html', buildDebug.buildHtml);
gulp.task('build-debug-css', buildDebug.buildCss);
gulp.task('build-debug-html-inject', buildDebug.injectHtml);

// gulp.task('build-debug', plugins.sequence(
//     'build-debug-init',
//     'build-debug-clean',
//     'build-debug-css',
//     'build-debug-script',
//     'build-debug-html',
//     'build-debug-html-inject'
// ));

var buildDebugTask = (function () {
    return plugins.sequence(
        'build-debug-clean',
        'build-debug-css',
        'build-debug-script',
        'build-debug-html',
        'build-debug-html-inject'
    );
}());

gulp.task('build-debug', buildDebugTask);

// buildDebugTask();
// buildDebug.injectHtml();

// buildDebug.buildCss();
