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
        counters[counterName] = {
            _used: 0,
            _total: 0
        };

        return F2(function(moduleName, id) {
            var counter = counters[counterName];

            counter[moduleName] = counter[moduleName] || {};
            counter[moduleName][id] = counter[moduleName][id] || { count: 0 };
            counter[moduleName][id].count += 1;

            return absurd;
        });
    }

    var expression = makeCounter("expressions");
    var declaration = makeCounter("declarations");
    var ifElseBranch = makeCounter("ifElseBranches");
    var caseBranch = makeCounter("caseBranches");
    var letDeclaration = makeCounter("letDeclarations");
    var lambdaBody = makeCounter("lambdaBodies");

    function initCounter(moduleName, info, counter, counterType) {
        List.toArray(info).forEach(function(info, idx) {
            var location = {
                from: { line: info.startPos._0, column: info.startPos._1 },
                to: { line: info.endPos._0, column: info.endPos._1 }
            };

            counter[moduleName] = counter[moduleName] || {};
            counter[moduleName][idx] = counter[moduleName][idx] || { count: 0 };
            counter[moduleName][idx].location = location;
        });
    }

    var init = function(moduleName, settings) {
        fs.writeFileSync(
            "../../../../.coverage/coverage-" + process.pid + ".marker",
            ""
        );

        fileMap.push(moduleName);

        Object.keys(counters).forEach(function(counter) {
            initCounter(
                moduleName,
                settings[counter],
                counters[counter],
                counter
            );
        });

        return absurd;
    };

    if (process) {
        process.on("exit", function() {
            var countersByModule = {};
            for (var moduleName of fileMap) {
                countersByModule[moduleName] = {};

                Object.keys(counters).forEach(function(counterName) {
                    var counter = counters[counterName];
                    countersByModule[moduleName][counterName] = counter[
                        moduleName
                    ]
                        ? Object.values(counter[moduleName])
                        : [];
                });
            }

            fs.writeFileSync(
                "../../../../.coverage/coverage-" + process.pid + ".json",
                JSON.stringify(countersByModule)
            );
            fs.writeFileSync(
                "../../../../.coverage/coverage-" + process.pid + ".created",
                ""
            );
        });
    }

    return {
        declaration: declaration,
        letDeclaration: letDeclaration,
        caseBranch: caseBranch,
        ifElseBranch: ifElseBranch,
        expression: expression,
        lambdaBody: lambdaBody,
        init: F2(init)
    };
})();
