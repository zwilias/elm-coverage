var _user$project$Native_Coverage = (function() {
    var List = _elm_lang$core$Native_List;
    var Utils = _elm_lang$core$Native_Utils;

    var declarationCounter = {};
    var caseBranchCounter = {};
    var ifElseCounter = {};
    var expressionCounter = {};
    var fileMap = [];

    function makeCounter(counter) {
        return F3(function(moduleName, id, expression) {
            counter[moduleName] = counter[moduleName] || {};
            counter[moduleName][id] = counter[moduleName][id] || 0;
            counter[moduleName][id] += 1;

            return expression;
        });
    }

    var declaration = makeCounter(declarationCounter);
    var caseBranch = makeCounter(caseBranchCounter);
    var ifElseBranch = makeCounter(ifElseCounter);
    var expression = makeCounter(expressionCounter);

    function initCounter(moduleName, info, counter) {
        List.toArray(info).forEach(function(fileOffset, idx) {
            counter[moduleName] = counter[moduleName] || {};
            counter[moduleName][idx] = counter[moduleName][idx] || 0;
        });
    }

    var init = function(moduleName, settings) {
        fileMap.push(moduleName);

        initCounter(moduleName, settings.declarations, declarationCounter);
        initCounter(moduleName, settings.caseBranches, caseBranchCounter);
        initCounter(moduleName, settings.ifElseBranches, ifElseCounter);
        initCounter(moduleName, settings.expressions, expressionCounter);

        return function() {
            throw new Error("... No.");
        };
    };

    if (process) {
        process.on("exit", function() {
            var coverageMap = {
                declarations: {
                    map: declarationCounter,
                    desc: "top-level declarations used",
                    used: 0,
                    total: 0
                },
                caseBranches: {
                    map: caseBranchCounter,
                    desc: "case patterns matched",
                    used: 0,
                    total: 0
                },
                ifElseBranches: {
                    map: ifElseCounter,
                    desc: "if/else branches entered",
                    used: 0,
                    total: 0
                },
                expressions: {
                    map: expressionCounter,
                    desc: "expressions evaluated",
                    used: 0,
                    total: 0
                }
            };

            var info = [
                "declarations",
                "caseBranches",
                "ifElseBranches",
                "expressions"
            ];

            console.log();
            for (var moduleName of fileMap) {
                console.log("Coverage for module " + moduleName);
                console.log();

                for (var infoKey of info) {
                    var usage = getUsage(coverageMap[infoKey].map[moduleName]);
                    coverageMap[infoKey].used += usage.used;
                    coverageMap[infoKey].total += usage.total;

                    printUsage(4, usage, coverageMap[infoKey].desc);
                }

                console.log();
            }

            console.log("Total coverage");
            console.log();

            for (var infoKey of info) {
                printUsage(4, coverageMap[infoKey], coverageMap[infoKey].desc);
            }

            console.log();
        });
    }

    function getUsage(counter) {
        var total = 0;
        var used = 0;

        for (var key in counter) {
            if (counter.hasOwnProperty(key)) {
                total += 1;
                used += counter[key] === 0 ? 0 : 1;
            }
        }

        return { used: used, total: total };
    }

    function printUsage(pad, usage, name) {
        var percentUsed = Math.round(usage.used / usage.total * 100);

        console.log(
            String(percentUsed).padStart(pad + 3) +
                "% " +
                name +
                " (" +
                usage.used +
                "/" +
                usage.total +
                ")"
        );
    }

    return {
        declaration: declaration,
        caseBranch: caseBranch,
        ifElseBranch: ifElseBranch,
        expression: expression,
        init: F2(init)
    };
})();
