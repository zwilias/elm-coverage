var fs = require("fs-extra"),
    Promise = require("bluebird"),
    path = require("path");

var elmTestGeneratedDir = path.join(
    ".coverage",
    "instrumented",
    "elm-stuff",
    "generated-code",
    "elm-community",
    "elm-test",
    "0.19.1"
);

module.exports = function(sourcePath) {
    return Promise.all([fs.readdir(elmTestGeneratedDir), readInfo()])
        .spread(function(fileList, infoData) {
            return Promise.reduce(
                fileList.filter(isCoverageDataFile).map(function(fileName) {
                    return readJsonFile(
                        path.join(elmTestGeneratedDir, fileName)
                    );
                }),
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
                coverageData: coverageData,
                moduleMap: moduleMap
            };
        });
};

function readJsonFile(filePath) {
    return new Promise(function(resolve, reject) {
        fs.readFile(filePath)
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
    return readJsonFile(path.join(".coverage", "info.json"));
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
    if (filePath.endsWith("elm.json") || filePath.endsWith("info.json")) {
        return false;
    }
    return filePath.endsWith(".json");
}

function toPath(sourcePath, moduleName) {
    var parts = moduleName.split(".");
    var moduleFile = parts.pop();
    parts.push(moduleFile + ".elm");

    return path.join.apply(path, [sourcePath].concat(parts));
}
