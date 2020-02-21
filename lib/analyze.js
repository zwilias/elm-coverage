var emitter = require("./analyzer"),
    fs = require("fs-extra"),
    Promise = require("bluebird"),
    packageInfo = require("../package.json"),
    path = require("path");

module.exports = function(allData) {

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

            var app = emitter.Elm.Analyzer.init({ flags: { version: packageInfo.version}});

            app.ports.receive.send({
                coverage: allData.coverageData,
                presentablePathMap: allData.presentablePathMap,
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
