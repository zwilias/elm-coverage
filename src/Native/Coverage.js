var _user$project$Native_Coverage = (function() {
    var List = _elm_lang$core$Native_List;
    var Utils = _elm_lang$core$Native_Utils;

    var declarationCounter = {};
    var caseBranchCounter = {};
    var ifElseCounter = {};
    var expressionCounter = {};
    var fileMap = {};

    function makeCounter(counter) {
        return F3(function(fileIdentifier, id, expression) {
            counter[fileIdentifier] = counter[fileIdentifier] || {};
            counter[fileIdentifier][id] = counter[fileIdentifier][id] || 0;
            counter[fileIdentifier][id] += 1;

            return expression;
        });
    }

    var declaration = makeCounter(declarationCounter);
    var caseBranch = makeCounter(caseBranchCounter);
    var ifElseBranch = makeCounter(ifElseCounter);
    var expression = makeCounter(expressionCounter);

    function initCounter(fileIdentifier, info, counter) {
        List.toArray(info).forEach(function(fileOffset, idx) {
            counter[fileIdentifier] = counter[fileIdentifier] || {};
            counter[fileIdentifier][idx] = counter[fileIdentifier][idx] || 0;
        });
    }

    var init = function(moduleName, fileIdentifier, settings) {
        fileMap[fileIdentifier] = moduleName;

        initCounter(fileIdentifier, settings.declarations, declarationCounter);
        initCounter(fileIdentifier, settings.caseBranches, caseBranchCounter);
        initCounter(fileIdentifier, settings.ifElseBranches, ifElseCounter);
        initCounter(fileIdentifier, settings.expressions, expressionCounter);

        return function() {
            throw new Error("... No.");
        };
    };

    if (process) {
        process.on("exit", function() {
            for (var fileIdentifier in fileMap) {
                console.log("Stats for " + fileMap[fileIdentifier]);
                console.log();

                printTopLevelUsage(
                    declarationCounter[fileIdentifier],
                    "top-level declarations used"
                );
                printTopLevelUsage(
                    caseBranchCounter[fileIdentifier],
                    "case patterns matched"
                );
                printTopLevelUsage(
                    ifElseCounter[fileIdentifier],
                    "if/else branches entered"
                );
                printTopLevelUsage(
                    expressionCounter[fileIdentifier],
                    "expressions evaluated"
                );
            }
        });
    }

    function printTopLevelUsage(counter, name) {
        var total = 0;
        var used = 0;

        for (var key in counter) {
            if (counter.hasOwnProperty(key)) {
                total += 1;
                used += counter[key] === 0 ? 0 : 1;
            }
        }

        var percentUsed = Math.round(used / total * 100);
        console.log(
            String(percentUsed).padStart(3) +
                "% " +
                name +
                " (" +
                used +
                "/" +
                total +
                ")"
        );
    }

    return {
        declaration: declaration,
        caseBranch: caseBranch,
        ifElseBranch: ifElseBranch,
        expression: expression,
        init: F3(init)
    };
})();
