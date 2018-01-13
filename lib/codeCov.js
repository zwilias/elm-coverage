var fs = require("fs-extra"),
    path = require("path");

module.exports = function(coverage) {
    return fs.writeJson(path.join(".coverage", "codecov.json"), coverage);
};
