module.exports = (function () {
    // var merge = require('merge-stream'),
    var fs = require('fs'),
        path = require('path'),
        rootPath = (function () {
            // 通过 nodejs 提供的 __dirname 可以获得当前文件的绝对路径
            var root = `${path.dirname(__dirname)}/`;
            return root;
        })();

    function getFolders(dir) {
        return fs.readdirSync(dir)
            .filter(function (file) {
                return fs.statSync(path.join(dir, file)).isDirectory();
            });
    };

    function getConfig(dir) {
        var folders = getFolders(dir),
            config = folders.map(function (value) {
                var config = require(path.join(dir, value, 'config'))();
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

    function getRealPaths(root, folderName, relativePaths) {
        // 取json对象的值， 转换为数组对象， 并添加dest路径
        return relativePaths.map(function (path) {
            return `${root}/${folderName}/${path}`;
        });
    }

    // 将二维数组合并为一维数组
    function mergeArray(arr) {
        var result = [];

        arr.forEach(function (item) {
            item.forEach(function (value) {
                result.push(value);
            });
        });

        return result;
    }

    // // 获取src目录下按文件夹区分组件方式，需要加载的资源文件
    // function getSource(src, exclude) {
    //     var configSrc = `${rootPath}/src`,
    //         buildConfig = getConfig(configSrc),
    //         source = [];

    //     buildConfig.forEach(function (configItem) {
    //         var folderName = configItem.folderName,
    //             css = mapJsonValue(configItem.css),
    //             sass = mapJsonValue(configItem.sass),
    //             js = mapJsonValue(configItem.js),
    //             cssPaths,
    //             sassPaths,
    //             excludePaths,
    //             jsPaths,
    //             allPaths,
    //             prioriSources,
    //             otherSources;

    //         // 需要优先加载的css、js文件
    //         cssPaths = getRealPaths(css, src, folderName);
    //         sassPaths = getRealPaths(sass, src, folderName);
    //         jsPaths = getRealPaths(js, src, folderName);
    //         excludePaths = getRealPaths(exclude, src, folderName);

    //         prioriSources = mergeArray([cssPaths, sassPaths, jsPaths]);
    //         // 将优先加载的文件路径加入到html注入资源列表
    //         if (prioriSources && prioriSources.length > 0) {
    //             source.push(prioriSources);
    //         }
    //         // 其他的css、js文件:
    //         allPaths = [`${src}/${folderName}/**/*.css`, `${src}/${folderName}/**/*.js`];
    //         excludePaths = mergeArray([prioriSources, excludePaths]);
    //         excludePaths = excludePaths.map(function (source) {
    //             return `!${source}`;
    //         });

    //         otherSources = mergeArray([allPaths, excludePaths]);
    //         // 将剩余加载的css、js的文件路径加入到html注入资源列表
    //         if (otherSources && otherSources.length > 0) {
    //             source.push(otherSources);
    //         }
    //     });

    //     return source;
    // }

    function parseSource(root, folderName, config, type) {
        var paths,
            includePaths,
            excludePaths;

        paths = mapJsonValue(config);
        // 取config配置文件中的json对象的相对路径path值，转换为实际路径的path数组
        paths = getRealPaths(root, folderName, paths);
        includePaths = paths;

        // 其他的文件的路径
        paths = [`${root}/${folderName}/**/*.${type}`];
        // 排除配置文件
        if (type === 'js') {
            paths.push(`!${root}/${folderName}/config.js`);
        }
        excludePaths = paths.concat(includePaths.map(function (path) {
            return `!${path}`;
        }));

        return [includePaths, excludePaths];
    }

    // 获取src目录下按文件夹区分组件方式，需要加载的资源文件
    function getSource(root) {
        var _rootPath = rootPath,
            configSrc = `${_rootPath}/src`,
            buildConfig = getConfig(configSrc),
            source = {
                css: [],
                sass: [],
                js: [],
                all: []
            };

        buildConfig.forEach(function (config) {
            var folderName = config.folderName,
                css,
                sass,
                js,
                type;

            type = 'css';
            css = parseSource(root, folderName, config[type], type);
            type = 'sass';
            sass = parseSource(root, folderName, config[type], type);
            type = 'js';
            js = parseSource(root, folderName, config[type], type);

            // 合并至资源中
            source.css = source.css.concat(css);
            source.sass = source.sass.concat(sass);
            source.js = source.js.concat(js);
        });

        source.all = source.css.concat(source.sass).concat(source.js);
        return source;
    }

    // // 获取src目录下按文件夹区分组件方式，需要加载的资源文件
    // function getSource(root) {
    //     var _rootPath = rootPath,
    //         configSrc = `${_rootPath}/src`,
    //         buildConfig = getConfig(configSrc),
    //         source = {
    //             css: [],
    //             sass: [],
    //             js: [],
    //             all: []
    //         };

    //     buildConfig.forEach(function (configItem) {
    //         var folderName = configItem.folderName,
    //             cssPaths = mapJsonValue(configItem.css),
    //             sassPaths = mapJsonValue(configItem.sass),
    //             jsPaths = mapJsonValue(configItem.js),
    //             css = [],
    //             sass = [],
    //             js = [];

    //         // 取config配置文件中的json对象的相对路径path值，转换为实际路径的path数组
    //         cssPaths = getRealPaths(root, folderName, cssPaths);
    //         sassPaths = getRealPaths(root, folderName, sassPaths);
    //         jsPaths = getRealPaths(root, folderName, jsPaths);

    //         css.push(cssPaths);
    //         sass.push(sassPaths);
    //         js.push(jsPaths);

    //         // 其他的css、js文件
    //         cssPaths = [`${root}/${folderName}/**/*.css`];
    //         cssPaths = cssPaths.concat(css.map(function (path) {
    //             return `!${path}`;
    //         }));
    //         css.push(cssPaths);

    //         sassPaths = [`${root}/${folderName}/**/*.scss`];
    //         if (sass.length > 0) {
    //             sassPaths = sassPaths.concat(sass.map(function (path) {
    //                 return `!${path}`;
    //             }));
    //             sass.push(sassPaths);
    //         }

    //         jsPaths = [`${root}/${folderName}/**/*.js`, `!${root}/${folderName}/config.js`];
    //         var excludePaths = js.map(function (value) {
    //             return `!${value}`;
    //         });
    //         jsPaths = jsPaths.concat(excludePaths);
    //         js.push(jsPaths);

    //         // 合并至资源中
    //         source.css = source.css.concat(css);
    //         source.sass = source.sass.concat(sass);
    //         source.js = source.js.concat(js);
    //     });

    //     source.all = source.css.concat(source.sass).concat(source.js);
    //     return source;
    // }

    // api
    return {
        getConfig: getConfig,
        mapJsonValue: mapJsonValue,
        getRealPaths: getRealPaths,
        mergeArray: mergeArray,
        getSource: getSource,
        rootPath: rootPath
    };
}());
