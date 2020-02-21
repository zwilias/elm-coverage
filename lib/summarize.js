var { table } = require("table");

var emptyRow = name => {
    var emptyCoverage = { covered: 0, count: 0 };
    return {
        moduleName: name,
        declaration: emptyCoverage,
        letDeclaration: emptyCoverage,
        lambdaBody: emptyCoverage,
        caseBranch: emptyCoverage,
        ifElseBranch: emptyCoverage
    };
};

var summarize = (moduleName, coverage) =>
    coverage.reduce(function(acc, item) {
        acc[item.type] = {
            covered: item.count
                ? acc[item.type].covered + 1
                : acc[item.type].covered,
            count: acc[item.type].count + 1
        };
        return acc;
    }, emptyRow(moduleName));

var toCount = ({ covered, count }) => {
    if (count > 0) {
        return (
            covered +
            "/" +
            count +
            " (" +
            Math.round(covered * 100 / count) +
            "%)"
        );
    } else {
        return "n/a";
    }
};

var toLine = row => [
    row.moduleName,
    toCount(row.declaration),
    toCount(row.letDeclaration),
    toCount(row.lambdaBody),
    toCount({
        covered: row.caseBranch.covered + row.ifElseBranch.covered,
        count: row.caseBranch.count + row.ifElseBranch.count
    })
];

module.exports.printSummary = function(data) {
    function sum(name, obj1, obj2) {
        return {
            count: obj1[name].count + obj2[name].count,
            covered: obj1[name].covered + obj2[name].covered
        };
    }

    var emptyCoverage = { covered: 0, count: 0 };

    var summary = Object.keys(data.coverageData)
        .map(function(key) {
            return summarize(data.presentablePathMap[key], data.coverageData[key]);
        })
        .reduce(
            function(acc, row) {
                acc.lines.push(toLine(row));
                acc.total = {
                    moduleName: acc.total.moduleName,
                    declaration: sum("declaration", acc.total, row),
                    letDeclaration: sum("letDeclaration", acc.total, row),
                    lambdaBody: sum("lambdaBody", acc.total, row),
                    caseBranch: sum("caseBranch", acc.total, row),
                    ifElseBranch: sum("ifElseBranch", acc.total, row)
                };
                return acc;
            },
            {
                lines: [
                    ["Module", "decls", "let decls", "lambdas", "branches"]
                ],
                total: emptyRow("total")
            }
        );

    summary.lines.push(toLine(summary.total));

    console.log(table(summary.lines));
};
