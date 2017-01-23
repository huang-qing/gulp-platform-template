module.exports = function (gulp, plugins, buildConfig) {
    var merge = require('merge-stream'),
        // fs = require('fs'),
        path = require('path'),
        buildPaths,
        util = require('./gulpfile/gulpfile.util');

    buildPaths = {
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
            src: './src/**/*.js',
            dest: './build/debug/'
        },
        html: {
            src: './src/index.html',
            dest: './build/debug',
            inject: {
                // 此文件路径会在buildInit时调整
                source: [],
                dest: './build/debug',
                src: './build/debug/index.html'
            }

        }
    };

    function buildDebugInit() {
        var config = buildConfig,
            paths = buildPaths,
            htmlInject = paths.html.inject;

        // 重置注入到html页面中的资源文件:遍历项目模块配置文件信息
        htmlInject.source = config.forEach(function (configItem) {
            var dest = htmlInject.dest,
                folderName = configItem.folderName,
                css = configItem.css,
                sass = configItem.sass,
                js = configItem.js,
                prioriSources,
                otherSources;

            // 需要优先加载的css、js文件
            prioriSources = util.mergeArray([util.getRealPaths(css, dest, folderName),
                util.getRealPaths(sass, dest, folderName),
                util.getRealPaths(js, dest, folderName)
            ]);

            // 其他的css、js文件:
            otherSources = [`${dest}/${folderName}/**/*.css`,
                `${dest}/${folderName}/**/*.js`
            ].concat(prioriSources.map(function (source) {
                return `!${source}`;
            }));

            // 重写htlm-inject-source 配置参数
            htmlInject.source = util.mergeArray([prioriSources, otherSources]);
        });
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

        paths = paths.sass;
        sass = gulp.src(paths.src)
            .pipe(plugins.plumber())
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.sass().on('error', plugins.sass.logError))
            .pipe(plugins.rename({
                dirname: 'css',
                suffix: '.sass'
            }));

        // 合并流，进行后续处理
        return merge(css, sass)
            // clean-css 不支持 sourcemaps,替换为 csso
            .pipe(plugins.autoprefixer())
            // .pipe(plugins.csso())
            .pipe(plugins.sourcemaps.write('.'))
            .pipe(gulp.dest(_buildPaths.dest));
    }

    function buildScript() {
        var _buildPaths = buildPaths,
            paths;

        paths = _buildPaths.script;
        return gulp.src(paths.src)
            .pipe(plugins.plumber())
            .pipe(plugins.eslint())
            .pipe(plugins.eslint.format())
            .pipe(plugins.eslint.failAfterError())
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.sourcemaps.write())
            .pipe(gulp.dest(_buildPaths.dest));
    }

    function buildHtml() {
        var _buildPaths = buildPaths,
            paths = _buildPaths.html;

        return gulp.src(paths.src)
            .pipe(gulp.dest(path.dest));
    }

    function injectHtml() {
        var _buildPaths = buildPaths,
            paths = _buildPaths.html,
            injectPaths = path.inject,
            target = gulp.src(injectPaths.src),
            srouces = [];

        injectPaths.source.forEach(function (item) {
            // console.dir(item);
            // console.dir('***');
            srouces.push(gulp.src(item, {
                read: false
            }));
        });

        var sources = merge(srouces);

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
