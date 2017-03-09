module.exports = function(gulp, plugins) {
    // merge-stream:用于合并 gulp pipe输出的流文件
    var merge = require('merge-stream'),
        // stream-series:用于保证流文件的执行顺序
        series = require('stream-series'),
        buffer = require('vinyl-buffer'),
        buildPaths,
        util = require('../gulpfile/gulpfile.util');
    // config = util.getConfig('./src');

    buildPaths = {
        // configSrc: `${util.rootPath}/src`,
        // 代码的源路径
        src: './src/',
        // 代码输出的路径
        dest: './build/',
        css: {
            // 代码源路径中全部的css文件
            src: './src/**/*.css',
            dest: './build/'
        },
        sass: {
            // 代码源路径中全部的scss文件
            src: './src/**/*.scss',
            dest: './build/debug/'
        },
        script: {
            // 代码源路径中全部的js文件
            src: ['./src/**/*.js'],
            dest: './build/',
            // 排除src一级目录下的config.js文件，此文件用于gulp任务相关的配置
            exclude: ['config.js']
        },
        html: {
            // 页面压缩：单页面应用的html文件
            src: './src/index.html',
            dest: './build',
            // 引入js、css自动注入
            inject: {
                // 此文件路径会在buildInit时调整,由config.js配置文件中的顺序进行加载
                source: [],
                // 排除src一级目录下的config.js文件，此文件用于gulp任务相关的配置
                exclude: ['config.js'],
                dest: './build',
                src: './build/index.html'
            }

        },
        image: {
            src: ['./src/**/*.jpg', './src/**/*.png'],
            dest: './build/'
        },
        pngSprite: {
            src: './src/',
            dest: './build/',
            // 此文件路径会在buildInit时调整,按config.js配置文件中的配置进行雪碧图制作
            source: []
        }
    };

    function buildDebugInit() {
        var paths = buildPaths,
            htmlInject = paths.html.inject,
            dest = htmlInject.dest,
            exclude = htmlInject.exclude,
            source = util.getSource(dest, exclude);
        // 重置注入到html页面中的资源文件:遍历项目模块配置文件信息
        htmlInject.source = source.css.concat(source.sass).concat(source.js);
        // 雪碧图 png
        paths.pngSprite.source = source.pngSprite;
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

        // css gulp
        paths = _buildPaths.css;
        css = gulp.src(paths.src)
            .pipe(plugins.plumber())
            .pipe(plugins.csslint('csslintrc.json'))
            .pipe(plugins.csslint.formatter())
            // css sourcemaps init
            .pipe(plugins.sourcemaps.init());

        // sass gulp
        paths = _buildPaths.sass;
        sass = gulp.src(paths.src)
            .pipe(plugins.plumber())
            // sass sourcemaps init
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.sass().on('error', plugins.sass.logError))
            // 为避免命名冲突，对sass文件添加.sass后缀，形成文件名称为:xxxx.sass.csss
            .pipe(plugins.rename({
                // dirname: 'css',
                suffix: '.sass'
            }));

        // 合并流，进行后续处理
        return merge(css, sass)
            // clean-css 不支持 sourcemaps,替换为 csso
            .pipe(plugins.autoprefixer())
            .pipe(plugins.csso())
            .pipe(plugins.sourcemaps.write())
            .pipe(gulp.dest(_buildPaths.dest));
    }

    function buildScript() {
        var _buildPaths = buildPaths,
            paths = _buildPaths.script;

        return gulp.src(paths.src)
            .pipe(plugins.plumber())
            // 暂不进行eslint检查，对代码格式要求较高
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
            dest = injectPaths.dest,
            sources = [];

        injectPaths.source.forEach(function(item, index) {
            item = item.map(function(path) {
                if (path.indexOf('!') === 0) {
                    return path.replace('!', `!${dest}/`);
                } else {
                    return `${dest}/${path}`;
                }
            });
            // console.dir(item);
            sources.push(gulp.src(item, {
                read: false
            }));
        });

        // Multiple sources when order is important 使用 merge-stream 保证输出的顺序
        sources = series(sources);

        return target
            .pipe(plugins.plumber())
            .pipe(plugins.inject(sources, {
                // 使用相对路径！！
                relative: true
            }))
            .pipe(gulp.dest(paths.dest));
    }

    function buildImage() {
        var _buildPaths = buildPaths,
            paths = _buildPaths.image;

        return gulp.src(paths.src)
            .pipe(plugins.imagemin())
            .pipe(gulp.dest(_buildPaths.dest));
    }

    // 生成png雪碧图
    function buildPngSprite() {
        var _buildPaths = buildPaths,
            paths = _buildPaths.pngSprite,
            src,
            dest,
            // size,
            stream = merge();

        paths.source.forEach(function(path) {
            for (var i in path) {
                src = `${paths.src}${path[i]}/*.png`;
                dest = `${paths.dest}${path[i]}/`;
                // size = i.slice(i.indexOf('@') + 1);

                // Generate our spritesheet
                var spriteData = gulp.src(src).pipe(plugins.spritesmith({
                    imgName: i + '.png',
                    cssName: i + '.css',
                    // 映射css样式表中的class命名格式
                    cssVarMap: function(sprite) {
                        var size = i.slice(i.indexOf('@') + 1);
                        sprite.name = `${size}-${sprite.name}`;
                    }
                }));
                // Pipe image stream through image optimizer and onto disk
                var imgStream = spriteData.img
                    // DEV: We must buffer our stream into a Buffer for `imagemin`
                    .pipe(buffer())
                    .pipe(plugins.imagemin())
                    .pipe(gulp.dest(dest));

                // Pipe CSS stream through CSS optimizer and onto disk
                var cssStream = spriteData.css
                    .pipe(plugins.csso())
                    .pipe(gulp.dest(dest));

                // Return a merged stream to handle both `end` events
                // 合并流 merge-stream
                stream.add(merge(imgStream, cssStream));
            }
        });

        return stream;
    }

    buildDebugInit();

    return {
        clean: clean,
        buildCss: buildCss,
        buildScript: buildScript,
        buildHtml: buildHtml,
        injectHtml: injectHtml,
        buildImage: buildImage,
        buildPngSprite: buildPngSprite
    };
};
