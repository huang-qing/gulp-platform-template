var gulp = require('gulp');
var merge = require('merge-stream');
var plugins = require('gulp-load-plugins')();
var fs = require('fs');
var path = require('path');

var paths = {
    root: './src/',
    // 开发环境:编译的临时文件的任务路径
    debug: {
        src: 'src/',
        dest: 'build/debug/',
        css: {
            src: 'src/**/*.css',
            // src:[]
            dest: 'build/debug/'
        },
        scss: {
            src: 'src/**/*.scss',
            // src: [],
            dest: 'build/debug/'
        },
        script: {
            src: 'src/**/*.js',
            // src:[]
            dest: 'build/debug/'
        },
        html: {
            src: './src/index.html',
            dest: './build/debug',
            inject: {
                // 此文件路径会在buildInit时调整
                source: [],
                // source: [],
                dest: './build/debug',
                src: './build/debug/index.html'
            }

        }
    },
    // 部署环境:最终目标文件的任务路径
    release: {

    },
    // 分发目录:最终发布的可执行程序和各种运行支持文件存放在此目录，打包此目录即可完成项目分发
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
    }
};

var buildConfig = [];
var buildPaths = {};

var isDebug,
    isDist,
    isRelease,
    isTest;

function getFolders(dir) {
    return fs.readdirSync(dir)
        .filter(function (file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
}

function getConfig() {
    var folders = getFolders(paths.root),
        config = folders.map(function (value) {
            var config = require(paths.root + value + '/config')();
            config.folderName = value;

            return config;
        });

    config = config.sort(function (a, b) {
        return a.index > b.index;
    });

    return config;
}

function mapJsonValue(json) {
    var arr = [];
    for (var i in json) {
        arr.push(json[i]);
    }

    return arr;
}

function setCurrentBuildType(type) {
    isDebug = type === buildType.debug;
    isDist = type === buildType.dist;
    isRelease = type === buildType.release;
    isTest = type === buildType.test;
}

function buildInit(type) {
    return function () {
        // config=getConfig();
        setCurrentBuildType(type);
    };
}

function buildDebugInit() {
    buildConfig = getConfig();
    buildPaths = paths.debug;

    var _config = buildConfig,
        _paths = buildPaths,
        htmlInject = _paths.html.inject;

    // console.dir(_config);

    // 重置注入到html页面中的资源文件
    _config.forEach(function (configItem) {
        // console.dir(configItem);
        var dest = htmlInject.dest,
            folderName = configItem.folderName,
            css = configItem.css,
            sass = configItem.sass,
            js = configItem.js,
            // 取json对象的值，转换为数组对象，并添加dest路径
            cssSources = mapJsonValue(css).map(function (source) {
                return `${dest}/${folderName}/${source}`;
            }),
            sassSources = mapJsonValue(sass).map(function (source) {
                return `${dest}/${folderName}/${source}.css`;
            }),
            jsSources = mapJsonValue(js).map(function (source) {
                return `${dest}/${folderName}/${source}`;
            }),
            prioriSources,
            otherSources;

        // 需要优先加载的css、js文件
        prioriSources = cssSources.concat(sassSources).concat(jsSources);
        // 其他的css、js文件
        otherSources = [`${dest}/${folderName}/**/*.css`,
            `${dest}/${folderName}/**/*.js`
        ].concat(prioriSources.map(function (source) {
            return `!${source}`;
        }));

        htmlInject.source.push(prioriSources);
        htmlInject.source.push(otherSources);
    });

    // console.dir(htmlInject.source);
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
            .pipe(plugins.if(!isDebug, plugins.rename({
                dirname: 'css',
                suffix: '.min'
            })))
            // clean-css 不支持 sourcemaps,替换为 csso
            .pipe(plugins.autoprefixer())
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
            // .pipe(plugins.eslint())
            // .pipe(plugins.if(!buildType.isRelease(type), plugins.eslint.format()))
            // .pipe(plugins.eslint.failAfterError())
            .pipe(plugins.sourcemaps.init())
            // .pipe(plugins.concat('main.js'))
            // .pipe(plugins.uglify())
            // .pipe(plugins.rename({
            //     suffix: '.min'
            // }))
            .pipe(plugins.sourcemaps.write())
            .pipe(gulp.dest(path.dest));
    };
}

function buildHtml(type) {
    return function () {
        var path = paths[type].html;

        return gulp.src(path.src)
            .pipe(plugins.if(!isDebug, plugins.htmlmin({
                collapseWhitespace: true
            })))
            .pipe(gulp.dest(path.dest));
    };
}

function injectHtml(type) {
    return function () {
        var path = paths[type].html,
            injectPath = path.inject,
            target = gulp.src(injectPath.src),
            srouces = [];

        // var sources1=gulp.src('./build/debug/base/css/bootstrap.min.css',{read:false});
        // var sources2=gulp.src(['./build/debug/**/**.css','!./build/debug/base/css/bootstrap.min.css'],{read:false});

        // console.dir(injectPath.source);

        // var source = injectPath.source.forEach(function (group) {
        //     console.dir(group);
        //     console.dir('---');
        // });

        console.dir(injectPath.source);
        console.dir('$$$$$');

        injectPath.source.forEach(function (group) {
            // var arr = [];

            // gulp.src(group, {
            //     read: false
            // });

            // console.dir(group);
            // console.dir('---');

            // 获取gulp stream 流数据
            //     return group.map(function (item) {
            //         console.dir(item);
            //         console.dir('***');
            //         return gulp.src(item, {
            //             read: false
            //         });
            //     });
            // });

            console.dir(group);
            console.dir('***');
            srouces.push(gulp.src(group, {
                read: false
            }));

            // group.forEach(function (item) {
            //     console.dir(item);
            //     console.dir('***');
            //     srouces.push(gulp.src(item, {
            //         read: false
            //     }));
            // });
        });

        var sources = merge(srouces);

        // var sources = gulp.src(injectPath.source, {
        //     read: false
        // });

        // var sources = gulp.src(injectPath.source, {
        //     read: false
        // });

        // var sources = gulp.src(injectPath.source, {
        //     read: false
        // });

        return target
            .pipe(plugins.plumber())
            .pipe(plugins.inject(sources, {
                // 使用相对路径
                relative: true
            }))
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

// gulp.task('sass', getTask('sass'));

// gulp.task('default', ['scripts', 'sass'], function () {
//     gulp.watch('src/js/**/*.js', ['scripts']);
//     gulp.watch('src/sass/**/*.{sass,scss}', ['sass']);
// });

gulp.task('test', function () {
    // getConfig();
    buildDebugInit();
    injectHtml(buildType.debug)();
});

gulp.task('inject', injectHtml(buildType.debug));
