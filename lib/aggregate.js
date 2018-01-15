var fs = require("fs-extra"),
    Promise = require("bluebird"),
    path = require("path");

module.exports = function(sourcePath) {
    return Promise.all([fs.readdir(".coverage"), readInfo()])
        .spread(function(fileList, infoData) {
            return Promise.reduce(
                fileList.filter(isCoverageDataFile).map(readJsonFile),
                addCoverage,
                infoData
            );
        })
        .then(function(coverageData) {
            var moduleMap = {};

            Object.keys(coverageData).forEach(function(moduleName) {
                moduleMap[moduleName] = toPath(sourcePath, moduleName);
            });

            return {
                event: "coverage",
                coverageData: coverageData,
                moduleMap: moduleMap
            };
        });
};

function readJsonFile(filePath) {
    return new Promise(function(resolve, reject) {
        fs
            .readFile(path.join(".coverage", filePath))
            .then(function(infoData) {
                try {
                    resolve(JSON.parse(infoData));
                } catch (e) {
                    reject(e);
                }
            })
            .catch(reject);
    });
}

function readInfo() {
    return readJsonFile("info.json");
}

function addCoverage(info, coverage) {
    Object.keys(coverage).forEach(function(module) {
        var evaluatedExpressions = coverage[module];

        evaluatedExpressions.forEach(function(idx) {
            info[module][idx].count = info[module][idx].count + 1 || 1;
        });
    });

    return info;
}

function isCoverageDataFile(filePath) {
    return filePath.endsWith(".json") && filePath !== "info.json";
}

function toPath(sourcePath, moduleName) {
    var parts = moduleName.split(".");
    var moduleFile = parts.pop();
    parts.push(moduleFile + ".elm");

    return path.join.apply(path, [sourcePath].concat(parts));
}
