var fs = require("fs");
var _user$project$Native_Coverage = (function() {
    var List = _elm_lang$core$Native_List;
    var Utils = _elm_lang$core$Native_Utils;

    var counters = {};

    var track = function(moduleName, idx) {
        counters[moduleName] = counters[moduleName] || [];
        counters[moduleName].push(idx);

        return absurd;
    };

    var absurd = function() {
        throw new Error("That's absurd!");
    };

    var cleanupHandler = function() {
        fs.writeFileSync(
            "../../../../.coverage/coverage-" + process.pid + ".json",
            JSON.stringify(counters)
        );
    };

    setTimeout(function() {
        app.ports.send.subscribe(function(rawData) {
            var data = JSON.parse(rawData);
            if (data.type === "FINISHED") {
                cleanupHandler();
            }
        });
    });

    return {
        track: F2(track)
    };
})();
