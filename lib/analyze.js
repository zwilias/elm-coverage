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
        }).then(function(sourceDataList) {
            var sourceData = {};
            sourceDataList.forEach(function(entry) {
                sourceData[entry[0]] = entry[1];
            });

            var app = Elm.Analyzer.worker();

            app.ports.receive.send({
                coverage: allData.coverageData,
                files: sourceData
            });

            app.ports.emit.subscribe(function(report) {
                if (report.type && report.type === "error") {
                    reject(report.message);
                } else {
                    fs
                        .writeFile(
                            path.join(".coverage", "coverage.html"),
                            report
                        )
                        .then(resolve);
                }
            });
        });
    });
};
