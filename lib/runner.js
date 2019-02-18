var Promise = require("bluebird"),
    find = require("find"),
    analyzer = require("./analyze"),
    _ = require("lodash"),
    fs = require("fs-extra"),
    tmp = Promise.promisifyAll(require("tmp")),
    spawn = require("cross-spawn"),
    path = require("path"),
    touch = require("touch"),
    moment = require("moment"),
    opn = require("opn"),
    aggregate = require("./aggregate"),
    codeCov = require("./codeCov"),
    { table } = require("table");

module.exports.run = function(args) {
    var log = createLogger(args);
    Promise.resolve()
        .then(prepare())
        .then(instrumentSources(log, args))
        .then(setupTests(log, args))
        .then(runTests(log, args))
        .then(generateReport(log, args))
        .then(finishUp(log, args))
        .catch(handleError(log));
};

module.exports.generateOnly = function(args) {
    var log = createLogger(args);
    Promise.resolve()
        .then(generateReport(log, args))
        .then(finishUp(log, args))
        .catch(handleError(log));
};

var elmInstrument = path.join(__dirname, "..", "bin", "elm-instrument");
var coverageDir = path.join(".coverage", "instrumented");
var fakeElmBinary = path.resolve(path.join(__dirname, "..", "bin", "fake-elm"));

function createLogger(args) {
    var isJsonOutput = args.report === "json";
    var logger = function(op) {
        return function(event, msg) {
            var now = "[" + moment().format("hh:mm:ss.SS") + "] ";

            if (isJsonOutput) {
                var message = {
                    event: event,
                    message: msg,
                    ts: moment()
                };

                op(JSON.stringify(message, null, 0));
            } else {
                op(now + msg);
            }
        };
    };
    return {
        debug: args.verbose ? logger(console.log) : function() {},
        info: logger(console.log),
        warn: logger(isJsonOutput ? console.log : console.error),
        error: logger(isJsonOutput ? console.log : console.error)
    };
}

var setupTests = (log, args) => () => {
    var tmpElmJson = path.join(coverageDir, "elm.json");
    return fs
        .readJson("elm.json")
        .then(function(elmPackage) {
            log.debug(
                "modifyingTests",
                "Generating elm.json for coverage at " + tmpElmJson + "..."
            );
            var covSrc = path.resolve(path.join(coverageDir, args.path));
            var originalPath = path.resolve(args.path);

            elmPackage["name"] = "author/project";

            return elmPackage;
        })
        .then(function(elmPackage) {
            log.debug("writeTestElmJson", "writing elm.json");
            return fs.writeJson(tmpElmJson, elmPackage);
        })
        .then(function() {
            var generatedTestsDir = path.join(coverageDir, "tests");
            log.debug(
                "copyTests",
                "Copying tests from " + args.tests + " to " + generatedTestsDir
            );
            return fs.copy(args.tests, generatedTestsDir);
        })
        .then(function() {
            return fs.copyFile(
                path.join(__dirname, "..", "kernel-src", "Coverage.elm"),
                path.join(coverageDir, args.path, "Coverage.elm")
            );
        })
        .then(function() {
            log.debug("testModificationComplete", "Setup complete");
        });
};

var runTests = (log, args) => () => {
    log.info("testRunInit", "Running tests...");
    return new Promise(function(resolve, reject) {
        log.debug(
            "testRun",
            "spawning " +
                args["elm-test"] +
                " --compiler " +
                fakeElmBinary +
                " " +
                args.tests
        );
        var process = spawn(
            args["elm-test"],
            ["--compiler", fakeElmBinary, args.tests]
                .concat(args._)
                .concat(args.report === "json" ? ["--report", "json"] : []),
            {
                // run elm-test in the instrumented files dir
                cwd: coverageDir,
                stdio: ["ignore", args.silent ? "ignore" : "inherit", "pipe"]
            }
        );

        var errStream = "";
        process.stderr.on("data", function(d) {
            errStream += d;
        });

        process.on("exit", function(exitCode) {
            if (exitCode === 0) {
                log.debug("testRunComplete", "Ran tests!");
                resolve();
            } else if (args.force) {
                log.info(
                    "testFailure",
                    "Some tests failed. `--force` passed so continuing."
                );
                resolve();
            } else {
                log.error("testFailure", "Ruh roh, tests failed.");
                reject(new Error(errStream));
            }
        });
    });
};

var prepare = () => () => {
    return new Promise(function(resolve, reject) {
        return fs
            .remove(".coverage")
            .then(function() {
                return fs.mkdirp(coverageDir);
            })
            .then(resolve);
    });
};

var allSources = args => {
    return new Promise(function(resolve, reject) {
        find.file(/\.(elm|js)$/, args.path, resolve);
    });
};

var instrumentSources = (log, args) => () => {
    return allSources(args)
        .then(function(files) {
            return Promise.map(
                files.filter(function(file) {
                    return !(
                        file.includes("elm-stuff") ||
                        file.includes(args.tests) ||
                        file.includes(".coverage")
                    );
                }),
                function(file) {
                    return fs.copy(file, path.join(coverageDir, file));
                }
            );
        })
        .then(function() {
            log.info("instrumenting", "Instrumenting sources...");

            return new Promise(function(resolve, reject) {
                var process = spawn(elmInstrument, [coverageDir]);
                var err = "";

                process.stderr.on("data", function(data) {
                    err += data;
                });
                process.on("error", function(code) {
                    log.error("instrumenting", "got error");
                    reject(err);
                });

                process.on("exit", function(code) {
                    log.debug("instrumenting", "finished instrumenting" + code);
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(err);
                    }
                });
            });
        });
};

var generateReport = (log, args) => () => {
    log.debug("aggregating", "Aggregating info");
    return aggregate(args.path)
        .then(function(data) {
            if (args.report != "json" && !args.silent) {
                printSummary(data);
            }
            return data;
        })
        .then(function(data) {
            switch (args.report) {
                case "json":
                    data["event"] = "coverage";
                    console.log(JSON.stringify(data, null, 0));
                    return Promise.resolve();
                case "human":
                    log.info("generating", "Generating report...");
                    return analyzer(args.path, data);
                case "codecov":
                    log.info(
                        "generating",
                        "Writing code coverage to " +
                            path.join(".coverage", "codecov.json")
                    );
                    return codeCov(data);
            }
        });
};

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

var printSummary = data => {
    function sum(name, obj1, obj2) {
        return {
            count: obj1[name].count + obj2[name].count,
            covered: obj1[name].covered + obj2[name].covered
        };
    }

    var emptyCoverage = { covered: 0, count: 0 };

    var summary = Object.keys(data.coverageData)
        .map(function(key) {
            return summarize(key, data.coverageData[key]);
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

var finishUp = (log, args) => () => {
    return Promise.map(allSources(args), function(file) {
        return touch(file);
    }).then(function() {
        if (args.report !== "human") {
            // Do nothing!
        } else if (args.open) {
            log.info("complete", "All done! Opening .coverage/coverage.html");
            opn(".coverage/coverage.html", { wait: false });
        } else {
            log.info(
                "complete",
                "All done! Your coverage is waiting for you in .coverage/coverage.html"
            );
        }
        return Promise.resolve();
    });
};

var handleError = log => e => {
    log.error("handleError", "Something went wrong: \n" + e.toString());
    process.exit(1);
};
