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

    function getRealPaths(relativePaths, destRootPath, folderName) {
        // 取json对象的值， 转换为数组对象， 并添加dest路径
        return relativePaths.map(function (source) {
            return `${destRootPath}/${folderName}/${source}`;
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

    // 获取需求加载的资源文件
    function getSource(src, exclude) {
        var configSrc = `${rootPath}/src`,
            buildConfig = getConfig(configSrc),
            source = [];

        buildConfig.forEach(function (configItem) {
            var folderName = configItem.folderName,
                css = mapJsonValue(configItem.css),
                sass = mapJsonValue(configItem.sass),
                js = mapJsonValue(configItem.js),
                cssPaths,
                sassPaths,
                excludePaths,
                jsPaths,
                allPaths,
                prioriSources,
                otherSources;

            // 需要优先加载的css、js文件
            cssPaths = getRealPaths(css, src, folderName);
            sassPaths = getRealPaths(sass, src, folderName);
            jsPaths = getRealPaths(js, src, folderName);
            excludePaths = getRealPaths(exclude, src, folderName);

            prioriSources = mergeArray([cssPaths, sassPaths, jsPaths]);
            // 将优先加载的文件路径加入到html注入资源列表
            if (prioriSources && prioriSources.length > 0) {
                source.push(prioriSources);
            }
            // 其他的css、js文件:
            allPaths = [`${src}/${folderName}/**/*.css`, `${src}/${folderName}/**/*.js`];
            excludePaths = mergeArray([prioriSources, excludePaths]);
            excludePaths = excludePaths.map(function (source) {
                return `!${source}`;
            });

            otherSources = mergeArray([allPaths, excludePaths]);
            // 将剩余加载的css、js的文件路径加入到html注入资源列表
            if (otherSources && otherSources.length > 0) {
                source.push(otherSources);
            }
        });

        return source;
    }

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
