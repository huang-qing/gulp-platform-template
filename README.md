# gulp-platform-template
使用gulp构建项目，实现项目工程化

## gulp plugins

+ [gulp-load-plugins](https://www.npmjs.com/package/gulp-load-plugins) : Automatically load any gulp plugins in your package.json

+ [gulp-sequence](https://www.npmjs.com/package/gulp-sequence/): Run a series of gulp tasks in order.

+ [gulp-eslint](https://www.npmjs.com/package/gulp-eslint/): A gulp plugin for processing files with ESLint

+ [gulp-htmlmin](https://www.npmjs.com/package/gulp-htmlmin/) : gulp plugin to minify HTML.

+ [gulp-clean](https://www.npmjs.com/package/gulp-clean): A gulp plugin for removing files and folders.


## [gulp-load-plugins](https://www.npmjs.com/package/gulp-load-plugins) : Automatically load any gulp plugins in your package.json

Install

~~~javascript
$ npm install --save-dev gulp-load-plugins
~~~

Given a package.json file that has some dependencies within:

~~~json
{
    "dependencies": {
        "gulp-jshint": "*",
        "gulp-concat": "*"
    }
}
~~~

Adding this into your Gulpfile.js:

~~~javascript
var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
~~~

Will result in the following happening (roughly, plugins are lazy loaded but in practice you won't notice any difference):

~~~javascript
plugins.jshint = require('gulp-jshint');
plugins.concat = require('gulp-concat');
~~~

## [gulp-sequence](https://www.npmjs.com/package/gulp-sequence/): Run a series of gulp tasks in order.

Install

~~~javascript
npm install --save-dev gulp-sequence
~~~

Usage

~~~javascript
var gulp = require('gulp')
var gulpSequence = require('gulp-sequence')
 
gulp.task('a', function (cb) {
  //... cb() 
})
 
gulp.task('b', function (cb) {
  //... cb() 
})
 
gulp.task('c', function (cb) {
  //... cb() 
})
 
gulp.task('d', function (cb) {
  //... cb() 
})
 
gulp.task('e', function (cb) {
  //... cb() 
})
 
gulp.task('f', function () {
  // return stream 
  return gulp.src('*.js')
})
 
// usage 1, recommend 
// 1. run 'a', 'b' in parallel; 
// 2. run 'c' after 'a' and 'b'; 
// 3. run 'd', 'e' in parallel after 'c'; 
// 3. run 'f' after 'd' and 'e'. 
gulp.task('sequence-1', gulpSequence(['a', 'b'], 'c', ['d', 'e'], 'f'))
 
// usage 2 
gulp.task('sequence-2', function (cb) {
  gulpSequence(['a', 'b'], 'c', ['d', 'e'], 'f', cb)
})
 
// usage 3 
gulp.task('sequence-3', function (cb) {
  gulpSequence(['a', 'b'], 'c', ['d', 'e'], 'f')(cb)
})
 
gulp.task('gulp-sequence', gulpSequence('sequence-1', 'sequence-2', 'sequence-3'))
~~~

with `gulp.watch`:

~~~javascript
gulp.watch('src/**/*.js', function (event) {
  gulpSequence('a', 'b')(function (err) {
    if (err) console.log(err)
  })
})
~~~


## [gulp-eslint](https://www.npmjs.com/package/gulp-eslint/):A gulp plugin for processing files with ESLint

Installation
Use npm.

~~~javascript
npm install gulp-eslint
~~~

Usage

~~~javascript
const gulp = require('gulp');
const eslint = require('gulp-eslint');
 
gulp.task('lint', () => {
    // ESLint ignores files with "node_modules" paths. 
    // So, it's best to have gulp ignore the directory as well. 
    // Also, Be sure to return the stream from the task; 
    // Otherwise, the task may end before the stream has finished. 
    return gulp.src(['**/*.js','!node_modules/**'])
        // eslint() attaches the lint output to the "eslint" property 
        // of the file object so it can be used by other modules. 
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console. 
        // Alternatively use eslint.formatEach() (see Docs). 
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on 
        // lint error, return the stream and pipe to failAfterError last. 
        .pipe(eslint.failAfterError());
});
 
gulp.task('default', ['lint'], function () {
    // This will only run if the lint task is successful... 
});

~~~

Or use the plugin API to do things like:

~~~javascript

gulp.src(['**/*.js','!node_modules/**'])
    .pipe(eslint({
        rules: {
            'my-custom-rule': 1,
            'strict': 2
        },
        globals: [
            'jQuery',
            '$'
        ],
        envs: [
            'browser'
        ]
    }))
    .pipe(eslint.formatEach('compact', process.stderr));

~~~

## [gulp-htmlmin](https://www.npmjs.com/package/gulp-htmlmin/) : gulp plugin to minify HTML.

Install with npm

~~~javascript
npm i gulp-htmlmin --save-dev
~~~

Usage

~~~javascript
var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
 
gulp.task('minify', function() {
  return gulp.src('src/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'));
});
~~~
----

## [gulp-clean](https://www.npmjs.com/package/gulp-clean): A gulp plugin for removing files and folders.

Install
Install with npm.

~~~javascript
npm install --save-dev gulp-clean
~~~

Examples

~~~javascript
var gulp = require('gulp');
var clean = require('gulp-clean');
 
gulp.task('default', function () {
    return gulp.src('app/tmp', {read: false})
        .pipe(clean());
});
~~~

----
