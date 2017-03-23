module.exports = function(gulp, plugins) {
    // merge-stream:用于合并 gulp pipe输出的流文件
    var merge = require('merge-stream'),
        // stream-series:用于保证流文件的执行顺序
        series = require('stream-series'),
        buffer = require('vinyl-buffer'),
        buildPaths,
        util = require('../gulpfile/gulpfile.util');

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
        },
        svgSprite: {
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
        // sprite svg
        paths.svgSprite.source = source.svgSprite;
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
            // .pipe(plugins.csslint('csslintrc.json'))
            // .pipe(plugins.csslint.formatter())
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

    // 生成svg雪碧图
    function buildSvgSprite() {
        var _buildPaths = buildPaths,
            paths = _buildPaths.svgSprite,
            src,
            dest,
            stream = merge();

        paths.source.forEach(function(path) {
            for (var i in path) {
                src = `${paths.src}${path[i]}/*.svg`;
                dest = `${paths.dest}${path[i]}/`;

                // console.log('svg-src:', src);
                // console.log('svg-dest:', dest);

                var svgStream = gulp.src(src)
                    .pipe(plugins.svgSymbols({
                        // slug: function(name) {
                        //     return name;
                        // }
                    }))
                    .pipe(plugins.rename({
                        // dirname: '',
                        // suffix: '.svg',
                        basename: i + '-symbols'
                    }))
                    .pipe(gulp.dest(dest));

                // 合并流 merge-stream
                stream.add(svgStream);
            }
        });

        return stream;
    }

    // 生成svg inline
    function buildSvgInline() {
        var _buildPaths = buildPaths,
            paths = _buildPaths.svgSprite,
            svgSrc,
            injectSrc = _buildPaths.html.inject.src,
            injectDest = _buildPaths.html.inject.dest,
            stream = merge();

        // 添加svg图片源
        paths.source.forEach(function(path) {
            for (var i in path) {
                svgSrc = `${paths.src}${path[i]}/*.svg`;
                // console.log('svg-src:', src);
                var svgStream = gulp.src(svgSrc);
                // 合并流 merge-stream
                stream.add(svgStream);
            }
        });

        var svgs = stream
            .pipe(plugins.svgstore({
                inlineSvg: true
            }));

        function fileContents(filePath, file) {
            return file.contents.toString();
        }

        return gulp.src(injectSrc)
            .pipe(plugins.inject(svgs, {
                transform: fileContents
            }))
            // 输出的路径为目录，而不是具体的html文件。
            // 否则报错：Error: EEXIST: file already exists, mkdir
            .pipe(gulp.dest(injectDest));
    }

    // 生成字体图片
    function buildIconFont(done) {
        var _buildPaths = buildPaths,
            paths = _buildPaths.svgSprite,
            src,
            dest = paths.dest,
            runTimestamp = Math.round(Date.now() / 1000),
            iconStream = merge();

        // 添加svg图片源,生成字体文件
        paths.source.forEach(function(path) {
            for (var i in path) {
                src = `${paths.src}${path[i]}/*.svg`;
                dest = `${paths.dest}${path[i]}/`;
                var fontName = i;
                var svgStream = gulp.src(src)
                    .pipe(plugins.iconfontCss({
                        fontName: fontName,
                        // path: 'node_modules/gulp-iconfont-css/templates/_icons.scss',
                        // 生成css文件的路径（名称）
                        targetPath: fontName + 'fontIcon.css',
                        // 引用字体文件的路径，这里为同一层
                        fontPath: '',
                        cssClass: fontName,
                        centerHorizontally: true
                    }))
                    .pipe(plugins.iconfont({
                        // required
                        fontName: fontName,
                        // recommended option
                        // prependUnicode: true ,
                        // default, 'woff2' and 'svg' are available
                        formats: ['ttf', 'eot', 'woff', 'woff2', 'svg'],
                        // recommended to get consistent builds when watching files
                        timestamp: runTimestamp
                    }))
                    .on('glyphs', function(glyphs, options) {
                        // CSS templating, e.g.
                        // console.log(glyphs, options);
                    })
                    .pipe(gulp.dest(dest));

                // 合并流 merge-stream
                iconStream.add(svgStream);
            }
        });

        return iconStream;
    }

    // 初始化配置参数
    buildDebugInit();

    return {
        clean: clean,
        buildCss: buildCss,
        buildScript: buildScript,
        buildHtml: buildHtml,
        injectHtml: injectHtml,
        buildImage: buildImage,
        buildPngSprite: buildPngSprite,
        buildSvgSprite: buildSvgSprite,
        buildSvgInline: buildSvgInline,
        buildIconFont: buildIconFont
    };
};
