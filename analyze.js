var Elm = require("./Analyzer");
var fs = require("fs");

fs.readFile(".coverage/coverage.json", function(err, data) {
    if (err) {
        throw err;
    }
    var moduleMap = JSON.parse(data.toString());
    var modules = Object.keys(moduleMap);

    var fileMap = [];
    modules.forEach(function(m) {
        var modulePath = m.split(".").join("/") + ".elm";
        fileMap.push([
            m,
            fs
                .readFileSync((process.argv[2] || ".") + "/" + modulePath)
                .toString()
        ]);
    });

    var app = Elm.Analyzer.worker({
        coverage: moduleMap,
        files: fileMap
    });

    app.ports.coverage.subscribe(function(coverage) {
        fs.writeFileSync(".coverage/coverage.html", coverage);
    });
});
