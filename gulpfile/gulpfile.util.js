module.exports = (function () {
    // var merge = require('merge-stream'),
    var fs = require('fs'),
        path = require('path');

    function getRootPath() {
        // 通过 nodejs 提供的 __dirname 可以获得当前文件的绝对路径
        var root = `${path.dirname(__dirname)}/`;
        return root;
    }

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
        var paths = mapJsonValue(relativePaths);
        return paths.map(function (source) {
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

    // api
    return {
        getConfig: getConfig,
        mapJsonValue: mapJsonValue,
        getRealPaths: getRealPaths,
        mergeArray: mergeArray,
        rootPath: getRootPath()
    };
}());
