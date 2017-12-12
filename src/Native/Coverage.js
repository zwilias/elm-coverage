var fs = require("fs");
var _user$project$Native_Coverage = (function() {
    var List = _elm_lang$core$Native_List;
    var Utils = _elm_lang$core$Native_Utils;

    var counters = {};
    var fileMap = [];
    var absurd = function() {
        throw new Error("That's absurd!");
    };

    function makeCounter(counterName) {
        return F2(function(moduleName, id) {
            counters[moduleName] = counters[moduleName] || {};
            counters[moduleName][counterName] =
                counters[moduleName][counterName] || [];

            var counter = counters[moduleName][counterName];

            counter[id] = counter[id] || { count: 0 };
            counter[id].count += 1;

            return absurd;
        });
    }

    var declaration = makeCounter("declarations");
    var ifElseBranch = makeCounter("ifElseBranches");
    var caseBranch = makeCounter("caseBranches");
    var letDeclaration = makeCounter("letDeclarations");
    var lambdaBody = makeCounter("lambdaBodies");

    function initCounter(info, counter) {
        List.toArray(info).forEach(function(info, idx) {
            var location = {
                from: { line: info.startPos._0, column: info.startPos._1 },
                to: { line: info.endPos._0, column: info.endPos._1 }
            };

            counter = counter || [];
            counter[idx] = counter[idx] || { count: 0 };
            counter[idx].location = location;
            counter[idx].name = info.name;
            counter[idx].complexity = info.complexity;
        });
    }

    var init = function(moduleName, settings) {
        fs.writeFileSync(
            "../../../../.coverage/coverage-" + process.pid + ".marker",
            ""
        );

        fileMap.push(moduleName);
        Object.keys(settings).forEach(function(counter) {
            counters[moduleName] = counters[moduleName] || {};
            counters[moduleName][counter] = counters[moduleName][counter] || [];
            initCounter(settings[counter], counters[moduleName][counter]);
        });

        return absurd;
    };

    process.on("exit", function() {
        console.log("Child exiting, writing coverage...");
        fs.writeFileSync(
            "../../../../.coverage/coverage-" + process.pid + ".json",
            JSON.stringify(counters)
        );
        fs.writeFileSync(
            "../../../../.coverage/coverage-" + process.pid + ".created",
            ""
        );
    });

    return {
        declaration: declaration,
        letDeclaration: letDeclaration,
        caseBranch: caseBranch,
        ifElseBranch: ifElseBranch,
        lambdaBody: lambdaBody,
        init: F2(init)
    };
})();
