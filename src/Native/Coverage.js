var _user$project$Native_Coverage = (function() {
    var List = _elm_lang$core$Native_List;
    var Utils = _elm_lang$core$Native_Utils;

    var counters = {};
    var fileMap = [];
    var absurd = function () {
        throw new Error("That's absurd!");
    }

    function makeCounter(counterName, description) {
        counters[counterName] = {
            _used: 0,
            _total: 0,
            _description: description
        };

        return F2(function(moduleName, id) {
            var counter = counters[counterName];

            counter[moduleName] = counter[moduleName] || {};
            counter[moduleName][id] = counter[moduleName][id] || { count: 0 };
            counter[moduleName][id].count += 1;

            return absurd;
        });
    }

    var expression = makeCounter("expressions", "expressions evaluated");
    var declaration = makeCounter(
        "declarations",
        "top-level declarations used"
    );
    var ifElseBranch = makeCounter(
        "ifElseBranches",
        "if/else branches entered"
    );
    var caseBranch = makeCounter("caseBranches", "case..of branches entered");
    var letDeclaration = makeCounter(
        "letDeclarations",
        "let declarations used"
    );
    var lambdaBody = makeCounter("lambdaBodies", "lambdas evaluated");

    function initCounter(moduleName, info, counter, counterType) {
        List.toArray(info).forEach(function(info, idx) {
            var location = {
                from: { line: info.startPos._0, column: info.startPos._1 },
                to: { line: info.endPos._0, column: info.endPos._1 }
            };

            counter[moduleName] = counter[moduleName] || {};
            counter[moduleName][idx] = counter[moduleName][idx] || { count: 0};
            counter[moduleName][idx].location = location;
        });
    }

    var init = function(moduleName, settings) {
        fileMap.push(moduleName);

        Object.keys(counters).forEach(function(counter) {
            initCounter(moduleName, settings[counter], counters[counter], counter);
        });

        return absurd;
    };

    if (process) {
        process.on("exit", function() {
            var countersByModule = {};

            console.log();
            for (var moduleName of fileMap) {
                console.log("Coverage for module " + moduleName);
                console.log();

                countersByModule[moduleName] = {};

                Object.keys(counters).forEach(function(counterName) {
                    var counter = counters[counterName];
                    countersByModule[moduleName][counterName] =
                        counter[moduleName]
                            ? Object.values(counter[moduleName])
                            : [];

                    var usage = getUsage(counter[moduleName]);
                    counter._used += usage.used;
                    counter._total += usage.total;

                    printUsage(4, usage, counter._description);
                });

                console.log();
            }

            console.log("Total coverage");
            console.log();

            Object.keys(counters).forEach(function(counterName) {
                var counter = counters[counterName];
                printUsage(
                    4,
                    { used: counter._used, total: counter._total },
                    counter._description
                );
            });

            console.log();
            fs.writeFileSync(
                "../../../../.coverage/coverage.json",
                JSON.stringify(countersByModule)
            );
        });
    }

    function getUsage(counter) {
        var total = 0;
        var used = 0;

        for (var key in counter) {
            if (counter.hasOwnProperty(key)) {
                total += 1;
                used += counter[key].count === 0 ? 0 : 1;
            }
        }

        return { used: used, total: total };
    }

    function printUsage(pad, usage, name) {
        var percentUsed =
            usage.total > 0
                ? Math.round(usage.used / usage.total * 100) + "%"
                : "";

        console.log(
            String(percentUsed).padStart(pad + 4) +
                " " +
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
        letDeclaration: letDeclaration,
        caseBranch: caseBranch,
        ifElseBranch: ifElseBranch,
        expression: expression,
        lambdaBody: lambdaBody,
        init: F2(init)
    };
})();
