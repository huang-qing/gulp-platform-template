module.exports = (function() {
    var fs = require('fs'),
        path = require('path'),
        rootPath = (function() {
            // 通过 nodejs 提供的 __dirname 可以获得当前文件的绝对路径
            var root = `${path.dirname(__dirname)}/`;
            return root;
        })();

    // 获取文件夹下一级目录
    function getFolders(dir) {
        return fs.readdirSync(dir)
            .filter(function(file) {
                return fs.statSync(path.join(dir, file)).isDirectory();
            });
    };

    // 获取config.js配置文件内容
    function getConfig(dir) {
        var folders = getFolders(dir),
            config = folders.map(function(value) {
                var config = require(path.join(dir, value, 'config'))();
                config.folderName = value;

                return config;
            });

        config = config.sort(function(a, b) {
            return a.index > b.index;
        });

        return config;
    }

    // 解析json转换为数组格式
    function mapJsonValue(json) {
        var arr = [];
        for (var i in json) {
            arr.push(json[i]);
        }

        return arr;
    }

    // 解析源目标文件夹下的资源，返回输出资源和排除的资源
    function parseSource(folderName, config, type) {
        var paths,
            includePaths,
            excludePaths;

        paths = mapJsonValue(config);
        // 取config配置文件中的json对象的相对路径path值，转换为实际路径的path数组
        // paths = getRealPaths(folderName, paths);
        paths = paths.map(function(path) {
            return `${folderName}/${path}`;
        });
        includePaths = paths;

        // 其他的文件的路径
        paths = [`${folderName}/**/*.${type}`];
        // 排除配置文件
        if (type === 'js') {
            paths.push(`!${folderName}/config.js`);
        }
        excludePaths = paths.concat(includePaths.map(function(path) {
            return `!${path}`;
        }));

        return [includePaths, excludePaths];
    }

    // 获取src目录下按文件夹区分组件方式，需要加载的资源文件
    function getSource() {
        var _rootPath = rootPath,
            configSrc = `${_rootPath}/src`,
            buildConfig = getConfig(configSrc),
            source = {
                css: [],
                sass: [],
                js: [],
                pngSprite: [],
                svgSprite: []
            };

        buildConfig.forEach(function(config) {
            var folderName = config.folderName,
                css,
                sass,
                js,
                pngSprite = [],
                svgSprite = [],
                type;

            // css sass js 转换为数组对象
            type = 'css';
            css = parseSource(folderName, config[type], type);
            type = 'sass';
            sass = parseSource(folderName, config[type], type);
            type = 'js';
            js = parseSource(folderName, config[type], type);

            // sprite png类型的配置文件
            pngSprite = config['pngSprite'];
            for (var i in pngSprite) {
                pngSprite[i] = `${folderName}/${pngSprite[i]}`;
            }

            // sprite svg类型的配置文件
            svgSprite = config['svgSprite'];
            for (var j in svgSprite) {
                svgSprite[j] = `${folderName}/${svgSprite[j]}`;
            }

            // 将整理好的资源合并至数据源中
            source.css = source.css.concat(css);
            source.sass = source.sass.concat(sass);
            source.js = source.js.concat(js);
            source.pngSprite = source.pngSprite.concat(pngSprite);
            source.svgSprite = source.svgSprite.concat(svgSprite);
        });

        // source.all = source.css.concat(source.sass).concat(source.js);
        return source;
    }

    // api
    return {
        getSource: getSource,
        rootPath: rootPath
    };
}());
