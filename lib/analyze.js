var Elm = require("./analyzer"),
    fs = require("fs-extra"),
    Promise = require("bluebird"),
    path = require("path");

module.exports = function(sourcePath, allData) {
    return new Promise(function(resolve, reject) {
        return Promise.map(Object.keys(allData.moduleMap), function(
            moduleName
        ) {
            return fs
                .readFile(allData.moduleMap[moduleName])
                .then(function(data) {
                    return [moduleName, data.toString()];
                });
        }).then(function(sourceData) {
            var app = Elm.Analyzer.worker({
                coverage: allData.coverageData,
                files: sourceData
            });

            app.ports.coverage.subscribe(function(report) {
                fs
                    .writeFile(path.join(".coverage", "coverage.html"), report)
                    .then(resolve);
            });
        });
    });
};
