var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

// gulpLoadPlugins({
//     rename: {
//         'gulp-clean-css': 'minifyCss'
//     }
// });


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
//gulp.task('debug:clean', getDebugTask('clean'));
gulp.task('debug:script', getDebugTask('script'));
gulp.task('debug:css', getDebugTask('css'));
//gulp.task('debug:html', getDebugTask('html'));
gulp.task('debug:html', getTask(debugTaskPath, 'html', debugPath));
gulp.task('build-debug', plugins.sequence('debug:clean', 'debug:css', 'debug:script', 'debug:html'));


var paths = {
    debug: {
        src: './src/',
        dest: './build/debug/',
        css: {
            src: './src/**/*.css',
            dest: './build/debug/'
        },
        scss: {
            src: './src/**/*.scss',
            dest: './build/debug/'
        },
        script: {
            src: './src/**/*.js',
            dest: './build/debug/'
        },
        html: {
            src: './src/index.html',
            dest: './build/debug/',
            inject: ['./build/debug/**/*.js', './build/debug/**/*.css']
        }
    }

};


var buildType = {
    debug: 'debug',
    release: 'release',
    test: 'test',
    dist: 'dist',
    isDebug: function (buildType) {
        return buildType === 'debug';
    },
    isRelease: function (buildType) {
        return buildType === 'release';
    },
    isTest: function (buildType) {
        return buildType === 'test';
    },
    isDist: function (buildType) {
        return buildType === 'dist';
    },
};



//清空文件夹
function clean(type) {
    return function () {
        var path = paths[type];
        return gulp.src(path.dest, {
            read: false
        }).pipe(plugins.clean());
    };
}

// function build(type) {
//     //gulp.task('clean', clean(buildType.debug));
//     return plugins.sequence(clean(type));
// }

function css(type) {
    return function () {
        var path = paths[type].css;

        return gulp.src(path.src)
            .pipe(plugins.plumber())
            .pipe(plugins.csslint())
            .pipe(plugins.csslint.formatter())
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.autoprefixer())
            .pipe(plugins.cleanCss({
                compatibility: 'ie8'
            }))
            .pipe(plugins.rename({
                suffix: '.min'
            }))
            .pipe(plugins.sourcemaps.write())
            .pipe(gulp.dest(path.dest));
    };
}

function sass(type) {
    return function () {
        var path = paths[type].scss;
        return gulp.src(path.src)
            .pipe(plugins.plumber())
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.sass().on('error', plugins.sass.logError))
            .pipe(plugins.autoprefixer())
            .pipe(plugins.cleanCss({
                compatibility: 'ie8'
            }))
            .pipe(plugins.rename({
                suffix: '.min2'
            }))
            .pipe(plugins.sourcemaps.write())
            .pipe(gulp.dest(path.dest));
    };
}

function script(type) {
    return function () {
        var path = paths[type].script;
        return gulp.src(path.src)
            .pipe(plugins.plumber())
            .pipe(plugins.eslint())
            .pipe(plugins.eslint.format())
            .pipe(plugins.eslint.failAfterError())
            .pipe(plugins.sourcemaps.init())
            //.pipe(plugins.concat('main.js'))
            .pipe(plugins.uglify())
            .pipe(plugins.rename({
                suffix: '.min'
            }))
            .pipe(plugins.sourcemaps.write())
            .pipe(gulp.dest(path.dest));
    };
}

function html(type) {
    return function () {
        var path = paths[type].html;
        var target = gulp.src(path.src);
        var sources = gulp.src(path.inject, {
            read: false
        });

        return target
            .pipe(plugins.plumber())
            .pipe(plugins.inject(sources))
            .pipe(plugins.if(!buildType.isDebug(type), plugins.htmlmin({
                collapseWhitespace: true
            })))
            .pipe(gulp.dest(path.dest));
    };
}


gulp.task('build-debug-clean', clean(buildType.debug));
gulp.task('build-debug-css', css(buildType.debug));
gulp.task('build-debug-sass', sass(buildType.debug));
gulp.task('build-debug-script', script(buildType.debug));
gulp.task('build-debug-html', html(buildType.debug));

gulp.task('build-debug', plugins.sequence(
    'build-debug-clean',
    'build-debug-sass',
    'build-debug-css',
    'build-debug-script',
    'build-debug-html'));







// function taskScript() {

//     return function () {
//         return gulp.src(paths.scripts.src)
//             .pipe(gulpif(linting, jshintChannel()))
//             .pipe(gulpif(compressing, uglify()))
//             .pipe(gulp.dest(paths.scripts.dest));
//     };
// }









//gulp.task('sass', getTask('sass'));

// gulp.task('default', ['scripts', 'sass'], function () {
//     gulp.watch('src/js/**/*.js', ['scripts']);
//     gulp.watch('src/sass/**/*.{sass,scss}', ['sass']);
// });