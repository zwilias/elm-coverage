var Elm = require("./Analyzer");
var fs = require("fs-extra");
var Promise = require("bluebird");
var path = require("path");

module.exports = function(sourcePath) {
    return new Promise(function(resolve, reject) {
        var files = fs.readdirSync(".coverage/").filter(function(f) {
            return f.endsWith("marker");
        });
        var moduleMap = {};

        Promise.map(files, function(markerFile) {
            return new Promise(function(res, rej) {
                var wait = function() {
                    if (
                        fs.existsSync(
                            ".coverage/" +
                                markerFile.replace("marker", "created")
                        )
                    ) {
                        console.log(
                            ".coverage/" + markerFile.replace("marker", "json")
                        );
                        res();
                    } else {
                        setTimeout(wait, 250);
                    }
                };
                wait();
            });
        }).then(function() {
            files
                .map(function(f) {
                    return f.replace("marker", "json");
                })
                .forEach(function(fileName) {
                    var data = JSON.parse(
                        fs.readFileSync(".coverage/" + fileName)
                    );

                    for (module in data) {
                        if (moduleMap[module]) {
                            for (coverageType in data[module]) {
                                moduleMap[module][coverageType] =
                                    moduleMap[module][coverageType] || [];

                                var coverage = data[module][coverageType];
                                for (var i = 0; i < coverage.length; i++) {
                                    var original =
                                        moduleMap[module][coverageType][i] ||
                                        {};

                                    moduleMap[module][coverageType][i] = {
                                        location:
                                            original.location ||
                                            coverage[i].location,
                                        count:
                                            (original.count || 0) +
                                            coverage[i].count
                                    };
                                }
                            }
                        } else {
                            moduleMap[module] = data[module];
                        }
                    }
                });

            var modules = Object.keys(moduleMap);

            var fileMap = [];
            modules.forEach(function(m) {
                var modulePath = m.split(".").join("/") + ".elm";
                var filePath = path.join(sourcePath, modulePath);
                fileMap.push([m, fs.readFileSync(filePath).toString()]);
            });

            var app = Elm.Analyzer.worker({
                coverage: moduleMap,
                files: fileMap
            });

            app.ports.coverage.subscribe(function(coverage) {
                fs.writeFileSync(".coverage/coverage.html", coverage);
                resolve();
            });
        });
    });
};
