var fs = require("fs-extra"),
    Promise = require("bluebird"),
    path = require("path"),
    glob = require("glob");

var elmTestGeneratedDir = glob.sync(path.join(
    ".coverage",
    "instrumented",
    "elm-stuff",
    "generated-code",
    "elm-community",
    "elm-test",
    "*"
))[0];


var revertOutOfRootFix = (path) => {
  return path.replace(/__dotdot/g,'..');
}

module.exports = function(rootPath) {
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
                moduleMap[moduleName] = toPath(rootPath, moduleName);
            });

            var presentablePathMap = {};

            Object.keys(coverageData).forEach(function(moduleName) {
                presentablePathMap[moduleName] = revertOutOfRootFix(moduleName);
            });

            return {
                coverageData: coverageData,
                moduleMap: moduleMap,
                presentablePathMap: presentablePathMap,
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

function toPath(rootPath, moduleName) {
    var parts = moduleName.split(".");

    // out of root fix revert
    // this has to be done after the split by dots...
    var parts1 = parts.map(part => part.replace(/__dotdot/g,'..'));

    var moduleFile = parts1.pop();
    parts1.push(moduleFile + ".elm");

    return path.join.apply(path, [rootPath].concat(parts1));
}
