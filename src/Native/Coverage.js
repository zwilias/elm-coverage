var _user$project$Native_Coverage = (function() {
    var List = _elm_lang$core$Native_List;
    var Utils = _elm_lang$core$Native_Utils;

    var tldeclCounter = {};
    var caseBranchCounter = {};
    var ifElseCounter = {};
    var exprCounter = {};

    function makeNullaryCounter(counter) {
        return function (id) {
            counter[id] = counter[id] || 0;
            counter[id] += 1;

            return Utils.Tuple0;
        }
    }

    function makeExpressionCounter(counter) {
        return function (id, expression) {
            counter[id] = counter[id] || 0;
            counter[id] += 1;

            return expression;
        }
    }

    var tldecl = makeNullaryCounter(tldeclCounter);
    var caseBranch = makeNullaryCounter(caseBranchCounter);
    var bool = makeNullaryCounter(ifElseCounter);
    var expr = makeExpressionCounter(exprCounter);

    var init = function(declarations, caseBranches, ifElseBranches, expressions) {
        List.toArray(declarations).forEach(function(fileOffset, idx) {
            tldeclCounter[idx] = tldeclCounter[idx] || 0;
        });

        List.toArray(caseBranches).forEach(function(fileOffset, idx) {
            caseBranchCounter[idx] = caseBranchCounter[idx] || 0;
        });

        List.toArray(ifElseBranches).forEach(function(fileOffset, idx) {
            ifElseCounter[idx] = ifElseCounter[idx] || 0;
        });

        for (var i = 0; i < expressions; i++) {
            exprCounter[i] = exprCounter[i] || 0;
        }

        return Utils.Tuple0;
    };

    if (process) {
        process.on("exit", function() {
            printTopLevelUsage(tldeclCounter, "top-level declarations used");
            printTopLevelUsage(caseBranchCounter, "case patterns matched");
            printTopLevelUsage(ifElseCounter, "if/else branches entered");
            printTopLevelUsage(exprCounter, "expressions evaluated");
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
        tldecl: tldecl,
        caseBranch: caseBranch,
        bool: bool,
        expr: F2(expr),
        init: F4(init)
    };
})();
