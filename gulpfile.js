var gulp = require('gulp');
//gulp-load-plugins:用于加载gulp plugins
//例如：plugins.jshint
var plugins = require('gulp-load-plugins')();
//开发环境:编译的临时文件的任务路径
var debugTaskPath = './gulp-tasks/debug/';
//部署环境:最终目标文件的任务路径
var releaseTaskPath = './gulp-tasks/release/';
//分发目录:最终发布的可执行程序和各种运行支持文件存放在此目录，打包此目录即可完成项目分发
var distTaskPath = './gulp-tasks/dist/';
//开发环境:编译的临时文件的生成路径
var debugPath = 'build/debug/';
//部署环境:最终目标文件的路径
var releasePath = 'build/release/';

//获取任务
function getTask(env, task, path) {
    return require(env + task)(gulp, plugins, path);
}

//获取debug任务
function getDebugTask(task) {
    return getTask(debugTaskPath, task, debugPath);
}

//获取release任务
function getReleaseTask(task) {
    return getTask(releaseTaskPath, task, releasePath);
}

//配置debug任务流程
gulp.task('debug:clean', getDebugTask('clean'));
gulp.task('debug:script', getDebugTask('script'));
gulp.task('debug:html', getDebugTask('html'));
gulp.task('debug', plugins.sequence('debug:clean', 'debug:script', 'debug:html'));
//gulp.task('sass', getTask('sass'));

// gulp.task('default', ['scripts', 'sass'], function () {
//     gulp.watch('src/js/**/*.js', ['scripts']);
//     gulp.watch('src/sass/**/*.{sass,scss}', ['sass']);
// });