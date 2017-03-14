# gulp-platform-template
使用gulp构建项目，实现项目工程化

## gulp plugins；

+ [stream-series](https://www.npmjs.com/package/stream-series) : Waterfalls for streams

+ [merge-stream](https://www.npmjs.com/package/merge-stream) : erge (interleave) a bunch of streams.

+ [gulp-load-plugins](https://www.npmjs.com/package/gulp-load-plugins) : Automatically load any gulp plugins in your package.json

+ [gulp-sequence](https://www.npmjs.com/package/gulp-sequence/): Run a series of gulp tasks in order.

+ [gulp-eslint](https://www.npmjs.com/package/gulp-eslint/): A gulp plugin for processing files with ESLint

+ [gulp-htmlmin](https://www.npmjs.com/package/gulp-htmlmin/) : gulp plugin to minify HTML.

+ [gulp-clean](https://www.npmjs.com/package/gulp-clean): A gulp plugin for removing files and folders.

+ [gulp-autoprefixer](https://github.com/sindresorhus/gulp-autoprefixer) : Prefix CSS with Autoprefixer

+ [gulp-sass](https://www.npmjs.com/package/gulp-sass) :  Gulp plugin for sass

+ **not support sourcemaps! fuck!**  ~~[gulp-clean-css](https://www.npmjs.com/package/gulp-clean-css) : Minify css with clean-css.~~
+ [gulp-csso](https://www.npmjs.com/package/gulp-csso) : Minify CSS with CSSO.

+ [gulp-uglify](https://www.npmjs.com/package/gulp-uglify) : Minify files with UglifyJS.

+ [gulp-sourcemaps](https://www.npmjs.com/package/gulp-sourcemaps) : Source map support for Gulp.js .[Plugins with gulp sourcemaps support](https://github.com/floridoo/gulp-sourcemaps/wiki/Plugins-with-gulp-sourcemaps-support)

+ [gulp-inject](https://www.npmjs.com/package/gulp-inject)
A javascript, stylesheet and webcomponent injection plugin for Gulp, i.e. inject file references into your index.html

+ [gulp-rename](https://www.npmjs.com/package/gulp-rename) : gulp-rename is a gulp plugin to rename files easily.

+ [gulp-concat](https://www.npmjs.com/package/gulp-concat) : Concatenates files

+ [gulp-csslint](https://www.npmjs.com/package/gulp-csslint/) : CSSLint plugin for gulp

+ [gulp-plumber](https://www.npmjs.com/package/gulp-plumber) : Prevent pipe breaking caused by errors from gulp plugins

+ [gulp-filter](https://www.npmjs.com/package/gulp-filter) : Filter files in a Vinyl stream

+ [gulp.spritesmith](https://www.npmjs.com/package/gulp.spritesmith) :Convert a set of images into a spritesheet and CSS variables via gulp

+ [gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin) Minify PNG, JPEG, GIF and SVG images with imagemin

+ [gulp-iconfont](https://www.npmjs.com/package/gulp-iconfont) : Create SVG/TTF/EOT/WOFF/WOFF2 fonts from several SVG icons with Gulp.

+ [gulp-svg-sprite](https://github.com/jkphl/gulp-svg-sprite) : SVG sprites & stacks galore — Gulp plugin wrapping around svg-sprite that reads in a bunch of SVG files, optimizes them and creates SVG sprites and CSS resources in various flavours

+ [gulp-svgstore](https://www.npmjs.com/package/gulp-svgstore) Combine svg files into one with <symbol> elements.




## 重点使用说明

### 雪碧图：

关于png、iconfont、svg的对比[可参考这篇文章](https://github.com/yalishizhude/sprite-demo)

[gulp.spritesmith](https://www.npmjs.com/package/gulp.spritesmith)用于制作png雪碧图

[gulp-iconfont](https://www.npmjs.com/package/gulp-iconfont)用于制作字体图标

[gulp-svg-sprites](https://www.npmjs.com/package/gulp-svg-sprites)用于制作svg图标


[svg4everybody](https://github.com/jonathantneal/svg4everybody) 这个shim解决所有的IE浏览器(包括IE11)不支持获得外链SVG文件某个元件


## 执行debug模式下的项目创建

~~~
gulp build-debug
~~~