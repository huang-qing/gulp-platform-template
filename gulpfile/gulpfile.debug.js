module.exports = function (gulp, plugins) {
    var merge = require('merge-stream'),
        // fs = require('fs'),
        // path = require('path'),
        series = require('stream-series'),
        buildPaths,
        util = require('../gulpfile/gulpfile.util');
    // buildConfig;

    buildPaths = {
        // configSrc: `${util.rootPath}/src`,
        src: './src/',
        dest: './build/debug/',
        css: {
            src: './src/**/*.css',
            dest: './build/debug/'
        },
        sass: {
            src: './src/**/*.scss',
            dest: './build/debug/'
        },
        script: {
            src: ['./src/**/*.js'],
            dest: './build/debug/',
            exclude: ['config.js']
        },
        html: {
            src: './src/index.html',
            dest: './build/debug',
            inject: {
                // 此文件路径会在buildInit时调整
                source: [],
                exclude: ['config.js'],
                dest: './build/debug',
                src: './build/debug/index.html'
            }

        }
    };

    // buildConfig = util.getConfig(buildPaths.configSrc);

    function buildDebugInit() {
        // var config = buildConfig,
        //     paths = buildPaths,
        //     htmlInject = paths.html.inject;

        // htmlInject.source = [];
        // 重置注入到html页面中的资源文件:遍历项目模块配置文件信息
        // config.forEach(function (configItem) {
        //     var dest = htmlInject.dest,
        //         folderName = configItem.folderName,
        //         css = util.mapJsonValue(configItem.css),
        //         sass = util.mapJsonValue(configItem.sass),
        //         js = util.mapJsonValue(configItem.js),
        //         cssPaths,
        //         sassPaths,
        //         excludePaths,
        //         jsPaths,
        //         allPaths,
        //         prioriSources,
        //         otherSources;

        //     // 需要优先加载的css、js文件
        //     cssPaths = util.getRealPaths(css, dest, folderName);
        //     sassPaths = util.getRealPaths(sass, dest, folderName);
        //     jsPaths = util.getRealPaths(js, dest, folderName);
        //     excludePaths = util.getRealPaths(htmlInject.exclude, dest, folderName);

        //     prioriSources = util.mergeArray([cssPaths, sassPaths, jsPaths]);
        //     // 将优先加载的文件路径加入到html注入资源列表
        //     if (prioriSources && prioriSources.length > 0) {
        //         htmlInject.source.push(prioriSources);
        //     }
        //     // 其他的css、js文件:
        //     allPaths = [`${dest}/${folderName}/**/*.css`, `${dest}/${folderName}/**/*.js`];
        //     excludePaths = util.mergeArray([prioriSources, excludePaths]);
        //     excludePaths = excludePaths.map(function (source) {
        //         return `!${source}`;
        //     });

        //     otherSources = util.mergeArray([allPaths, excludePaths]);
        //     // 将剩余加载的css、js的文件路径加入到html注入资源列表
        //     if (otherSources && otherSources.length > 0) {
        //         htmlInject.source.push(otherSources);
        //     }
        // });

        var paths = buildPaths,
            htmlInject = paths.html.inject,
            dest = htmlInject.dest,
            exclude = htmlInject.exclude,
            source = util.getSource(dest, exclude);
        // 重置注入到html页面中的资源文件:遍历项目模块配置文件信息
        htmlInject.source = source.all;
    }

    function clean() {
        var paths = buildPaths;

        return gulp.src(paths.dest, {
            read: false
        }).pipe(plugins.clean());
    }

    function buildCss() {
        var _buildPaths = buildPaths,
            paths,
            css,
            sass;

        paths = _buildPaths.css;
        css = gulp.src(paths.src)
            .pipe(plugins.plumber())
            .pipe(plugins.csslint('csslintrc.json'))
            .pipe(plugins.csslint.formatter())
            .pipe(plugins.sourcemaps.init());

        paths = _buildPaths.sass;
        sass = gulp.src(paths.src)
            .pipe(plugins.plumber())
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.sass().on('error', plugins.sass.logError))
            .pipe(plugins.rename({
                // dirname: 'css',
                suffix: '.sass'
            }));

        // 合并流，进行后续处理
        return merge(css, sass)
            // clean-css 不支持 sourcemaps,替换为 csso
            .pipe(plugins.autoprefixer())
            // .pipe(plugins.csso())
            .pipe(plugins.sourcemaps.write())
            .pipe(gulp.dest(_buildPaths.dest));
    }

    function buildScript() {
        var _buildPaths = buildPaths,
            paths = _buildPaths.script;

        return gulp.src(paths.src)
            .pipe(plugins.plumber())
            // .pipe(plugins.eslint())
            // .pipe(plugins.eslint.format())
            // .pipe(plugins.eslint.failAfterError())
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.sourcemaps.write())
            .pipe(gulp.dest(_buildPaths.dest));
    }

    function buildHtml() {
        var _buildPaths = buildPaths,
            paths = _buildPaths.html;

        return gulp.src(paths.src)
            .pipe(gulp.dest(paths.dest));
    }

    function injectHtml() {
        var _buildPaths = buildPaths,
            paths = _buildPaths.html,
            injectPaths = paths.inject,
            target = gulp.src(injectPaths.src),
            sources = [];

        injectPaths.source.forEach(function (item) {
            sources.push(gulp.src(item, {
                read: false
            }));
        });

        // Multiple sources when order is important 使用 merge-stream 保证输出的顺序
        sources = series(sources);

        return target
            .pipe(plugins.plumber())
            .pipe(plugins.inject(sources, {
                // 使用相对路径
                relative: true
            }))
            .pipe(gulp.dest(paths.dest));
    }

    buildDebugInit();

    return {
        clean: clean,
        buildCss: buildCss,
        buildScript: buildScript,
        buildHtml: buildHtml,
        injectHtml: injectHtml
    };
};
