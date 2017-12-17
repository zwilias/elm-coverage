var fs = require("fs-extra"),
    Promise = require("bluebird"),
    path = require("path");

module.exports = function(data) {
    var coverage = parseData(data);

    return fs.writeJson(path.join(".coverage", "codecov.json"), coverage);
};

function parseData(data) {
    var result = {};

    Object.keys(data.moduleMap).forEach(function(module) {
        result[data.moduleMap[module]] = toCodeCov(data.coverageData[module]);
    });

    return { coverage: result };
}

function toCodeCov(moduleCoverage) {
    var lineData = {};

    moduleCoverage.forEach(function(hit) {
        for (var i = hit.from.line; i <= hit.to.line; i++) {
            var line = "" + i;
            lineData[line] = combine(lineData[line], hit.count || 0);
        }
    });

    return lineData;
}

function combine(current, newInfo) {
    return current === undefined ? newInfo : Math.min(current, newInfo);
}
