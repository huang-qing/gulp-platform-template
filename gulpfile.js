var gulp = require('gulp');
var merge = require('merge-stream');
var plugins = require('gulp-load-plugins')();


var paths = {
    //开发环境:编译的临时文件的任务路径
    debug: {
        src: 'src/',
        dest: 'build/debug/',
        css: {
            src: 'src/**/*.css',
            dest: 'build/debug/'
        },
        scss: {
            src: 'src/**/*.scss',
            dest: 'build/debug/'
        },
        script: {
            src: 'src/**/*.js',
            dest: 'build/debug/'
        },
        html: {
            src: './src/index.html',
            dest: './build/debug',
            inject: {
                source: ['./build/debug/**/*.js', './build/debug/**/*.css'],
                dest: './build/debug',
                src: './build/debug/index.html'
            }

        }
    },
    //部署环境:最终目标文件的任务路径
    release: {

    },
    //分发目录:最终发布的可执行程序和各种运行支持文件存放在此目录，打包此目录即可完成项目分发
    dist: {}

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

var isDebug,
    isDist,
    isRelease,
    isTest;

function setCurrentBuildType(type) {
    isDebug = type === buildType.debug;
    isDist = type === buildType.dist;
    isRelease = type === buildType.release;
    isTest = type === buildType.test;
}

function buildInit(type) {
    return function () {
        setCurrentBuildType(type);
    };
}

function clean(type) {
    return function () {
        var path = paths[type];
        return gulp.src(path.dest, {
            read: false
        }).pipe(plugins.clean());
    };
}

function buildCss(type) {
    return function () {

        var cssPath = paths[type].css;
        var css = gulp.src(cssPath.src)
            .pipe(plugins.plumber())
            .pipe(plugins.csslint('csslintrc.json'))
            .pipe(plugins.if(isDebug, plugins.csslint.formatter()))
            .pipe(plugins.if(isDebug || isTest, plugins.sourcemaps.init()));


        var sassPath = paths[type].scss;
        var sass = gulp.src(sassPath.src)
            .pipe(plugins.plumber())
            .pipe(plugins.if(isDebug || isTest, plugins.sourcemaps.init()))
            .pipe(plugins.sass().on('error', plugins.sass.logError))
            .pipe(plugins.if(isDebug, plugins.rename({
                dirname: 'css',
                suffix: '.sass'
            })));

        return merge(css, sass).pipe(plugins.if(isTest || isDist || isRelease, plugins.concat('main.css')))
            .pipe(plugins.if(isTest || isDist || isRelease, plugins.rename({
                dirname: 'css',
                suffix: '.min'
            })))
            //执行 autoprefixer、cleanCss 时会造成sourcemaps失效，官网说支持。但是一直不行，未找到有效解决方案。
            
            .pipe(plugins.autoprefixer())
            //  clean-css 不支持 sourcemaps,替换为 csso
            // .pipe(plugins.cleanCss({
            //     compatibility: 'ie8'
            // }))
            .pipe(plugins.csso())
            .pipe(plugins.if(isDebug || isTest, plugins.sourcemaps.write('.')))

            .pipe(gulp.dest(cssPath.dest));
    };
}

function buildScript(type) {
    return function () {
        var path = paths[type].script;
        return gulp.src(path.src)
            .pipe(plugins.plumber())
            .pipe(plugins.eslint())
            .pipe(plugins.if(!buildType.isRelease(type), plugins.eslint.format()))
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

function buildHtml(type) {
    return function () {
        var path = paths[type].html;

        return gulp.src(path.src)
            .pipe(plugins.if(!buildType.isDebug(type), plugins.htmlmin({
                collapseWhitespace: true
            })))
            .pipe(gulp.dest(path.dest));
    };
}

function injectHtml(type) {
    return function () {
        var path = paths[type].html;
        var injectPath = path.inject;

        var target = gulp.src(injectPath.src);
        var sources = gulp.src(injectPath.source, {
            read: false
        });

        return target
            .pipe(plugins.plumber())
            .pipe(plugins.inject(sources, {
                //使用相对路径
                relative: true
            }))
            .pipe(plugins.if(!buildType.isDebug(type), plugins.htmlmin({
                collapseWhitespace: true
            })))
            .pipe(gulp.dest(path.dest));
    };
}

gulp.task('build-debug-init', buildInit(buildType.debug));
gulp.task('build-debug-clean', clean(buildType.debug));
gulp.task('build-debug-script', buildScript(buildType.debug));
gulp.task('build-debug-html', buildHtml(buildType.debug));
gulp.task('build-debug-css', buildCss(buildType.debug));
gulp.task('build-debug-html-inject', injectHtml(buildType.debug));

gulp.task('build-debug', plugins.sequence(
    'build-debug-init',
    'build-debug-clean',
    'build-debug-css',
    'build-debug-script',
    'build-debug-html',
    'build-debug-html-inject'
));





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