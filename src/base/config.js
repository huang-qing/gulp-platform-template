module.exports = function () {
    return {
        index: 0,
        // 对加载顺序有明确要求的CSS文件，按顺序写入配置项。
        css: {
            'bootstrap': 'css/bootstrap.min.css'
        },
        // 对加载顺序有明确要求的sass文件，按顺序写入配置项。
        sass: {

        },
        // 对加载顺序有明确要求的js文件，按顺序写入配置项。
        js: {
            'jquery': 'js/jquery.js',
            'raphael': 'js/raphael.js'
        },
        eslint: false
    };
};
