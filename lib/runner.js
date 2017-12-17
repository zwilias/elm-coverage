var Promise = require("bluebird"),
    yargs = require("yargs"),
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
    codeCov = require('./codeCov'),
    args = require("./cliArgs").argv;

var elmInstrument = path.join(__dirname, "..", "bin", "elm-instrument");
var coverageDir = path.join(".coverage", "instrumented");
var isJsonOutput = args.report === 'json';

var logger = function(op) {
    return function(msg) {
        var now = "[" + moment().format("hh:mm:ss.SS") + "] ";

        if (isJsonOutput) {
            var message = {
                message: msg,
                ts: moment()
            };

            op(JSON.stringify(message, null, 0));
        } else {
            op(now + msg);
        }
    };
};

var log = {
    debug: args.verbose && !args.quiet ? logger(console.log) : function() {},
    info: args.quiet ? function() {} : logger(console.log),
    warn: logger(isJsonOutput ? console.log : console.error),
    error: logger(isJsonOutput ? console.log : console.error)
};

Promise.resolve()
    .then(prepare)
    .then(instrumentSources)
    .then(modifyTestsPackageJson)
    .then(runTests)
    .finally(cleanup)
    .then(generateReport)
    .then(finishUp)
    .catch(handleError);

function modifyTestsPackageJson() {
    var testsElmPackageJsonPath = path.join(args.tests, "elm-package.json");
    log.debug("Modifying " + testsElmPackageJsonPath + "...");
    return fs
        .readJson(testsElmPackageJsonPath)
        .then(function(elmPackage) {
            var tmpFile = path.join(".coverage", "elm-package.json.bak");
            return fs.copy(testsElmPackageJsonPath, tmpFile).then(function() {
                log.info(
                    "Wrote original " +
                        testsElmPackageJsonPath +
                        " to " +
                        tmpFile
                );
                return elmPackage;
            });
        })
        .then(function(elmPackage) {
            var covSrc = path.resolve(path.join(coverageDir, args.path));
            var originalPath = path.resolve(args.path);

            elmPackage["native-modules"] = true;
            elmPackage["repository"] = "https://github.com/user/project.git";
            elmPackage["source-directories"] = elmPackage[
                "source-directories"
            ].map(function(item) {
                if (path.resolve(path.join(args.tests, item)) == originalPath) {
                    return covSrc;
                } else {
                    return item;
                }
            });
            elmPackage["source-directories"].push(
                path.dirname(require.resolve("../package.json")) + "/kernel-src"
            );

            return elmPackage;
        })
        .then(function(elmPackage) {
            return fs.writeJson(testsElmPackageJsonPath, elmPackage);
        })
        .then(function() {
            log.debug("Modified " + testsElmPackageJsonPath);
        });
}

function runTests() {
    log.info("Running tests...");
    return new Promise(function(resolve, reject) {
        var process = spawn(
            args["elm-test"],
            [args.tests]
                .concat(args._)
                .concat(isJsonOutput ? ["--report", "json"] : []),
            {
                stdio: [
                    "ignore",
                    args.silent || args.quiet ? "ignore" : "inherit",
                    "pipe"
                ]
            }
        );

        var errStream = "";
        process.stderr.on("data", function(d) {
            errStream += d;
        });

        process.on("exit", function(exitCode) {
            if (exitCode === 0) {
                log.debug("Ran tests!");
                resolve();
            } else if (args.force) {
                log.info("Some tests failed. `--force` passed so continuing.");
                resolve();
            } else {
                log.error("Ruh roh, tests failed.");
                reject(new Error(errStream));
            }
        });
    });
}

function cleanup() {
    log.debug("Cleaning up...");
    var tmpFile = path.join(".coverage", "elm-package.json.bak");

    return fs
        .copy(tmpFile, path.join(args.tests, "elm-package.json"))
        .then(function() {
            log.info("Restored " + path.join(args.tests, "elm-package.json"));
        })
        .catch(function() {});
}

function prepare() {
    return new Promise(function(resolve, reject) {
        return fs
            .remove(".coverage")
            .then(function() {
                return fs.mkdirp(coverageDir);
            })
            .then(resolve);
    });
}

function allSources() {
    return new Promise(function(resolve, reject) {
        find.file(/\.elm$/, args.path, resolve);
    });
}

function instrumentSources() {
    return allSources()
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
            log.info("Instrumenting sources...");

            return new Promise(function(resolve, reject) {
                var process = spawn(elmInstrument, [coverageDir]);
                var err = "";

                process.stderr.on("data", function(data) {
                    err += data;
                });

                process.on("exit", function(code) {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(err);
                    }
                });
            });
        });
}

function generateReport() {
    log.debug("Aggregating info");
    return aggregate(args.path).then(function(data) {
        switch (args.report) {
        case 'json':
            console.log(JSON.stringify(data, null, 0));
            return Promise.resolve();
        case 'human':
            log.info("Generating report...");
            return analyzer(args.path, data);
        case 'codecov':
            log.info("Writing code coverage to " + path.join('.coverage', 'codecov.json'));
            return codeCov(data);
        }
    });
}

function finishUp() {
    return Promise.map(allSources(), function(file) {
        return touch(file);
    }).then(function() {
        if (args.report !== "human") {
            // Do nothing!
        } else if (args.open) {
            log.info("All done! Opening .coverage/coverage.html");
            opn(".coverage/coverage.html", { wait: false });
        } else {
            log.info(
                "All done! Your coverage is waiting for you in .coverage/coverage.html"
            );
        }
        return Promise.resolve();
    });
}

function handleError(e) {
    log.error("Something went wrong: \n" + e.toString());
    process.exit(1);
}
