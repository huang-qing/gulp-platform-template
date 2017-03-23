var gulp = require('gulp');
// 加载gulp-load-plugins,用于加载其他的gulp插件库
var plugins = require('gulp-load-plugins')();
// 将debug环境下的相关task在一个文件中单独管
// 可参考 项目中 doc/splitting a gulpfile into multiple files.md
var buildDebug = require('./gulpfile/gulpfile.debug')(gulp, plugins);

// 建立 debug 环境下的相关任务
gulp.task('build-debug-clean', buildDebug.clean);
gulp.task('build-debug-script', buildDebug.buildScript);
gulp.task('build-debug-html', buildDebug.buildHtml);
gulp.task('build-debug-css', buildDebug.buildCss);
gulp.task('build-debug-image', buildDebug.buildImage);
gulp.task('build-debug-html-inject', buildDebug.injectHtml);
gulp.task('build-debug-sprite-png', buildDebug.buildPngSprite);
gulp.task('build-debug-sprite-svg', buildDebug.buildSvgSprite);
gulp.task('build-debug-sprite-svg-inline', buildDebug.buildSvgInline);
gulp.task('build-debug-iconfont', buildDebug.buildIconFont);

var buildDebugTask = (function() {
    return plugins.sequence(
        'build-debug-clean', [
            'build-debug-sprite-png',
            'build-debug-sprite-svg',
            'build-debug-iconfont'
        ], [
            'build-debug-css',
            'build-debug-script',
            'build-debug-image',
            'build-debug-html'
        ],
        'build-debug-html-inject',
        'build-debug-sprite-svg-inline'
    );
}());

gulp.task('build-debug', buildDebugTask);

// 通过方法调用执行：放开注释用于测试
// buildDebugTask();
// buildDebug.clean();
// buildDebug.buildScript();
// buildDebug.buildHtml();
// buildDebug.buildCss();
// buildDebug.buildPngSprite();
// buildDebug.injectHtml();
