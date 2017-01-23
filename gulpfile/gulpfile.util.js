module.exports = (function () {
    var merge = require('merge-stream'),
        fs = require('fs'),
        path = require('path');

    function getFolders(dir) {
        return fs.readdirSync(dir)
            .filter(function (file) {
                return fs.statSync(path.join(dir, file)).isDirectory();
            });
    }

    function getConfig(path) {
        var folders = getFolders(path),
            config = folders.map(function (value) {
                var config = require(path + value + '/config')();
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
        return mapJsonValue(relativePaths).map(function (source) {
            return `${destRootPath}/${folderName}/${source}`;
        });
    }

    function mergeArray(arr) {
        return [].push.apply([], arr);
    }

    return {
        getConfig: getConfig,
        mapJsonValue: mapJsonValue,
        getRealPaths: getRealPaths,
        mergeArray: mergeArray
    };
}());
