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
    args = require("./cliArgs").argv;

var elmInstrument = path.join(__dirname, "..", "bin", "elm-instrument");
var coverageDir = path.join(".coverage", "instrumented");

var logger = function(op) {
    return function() {
        var args = Array.from(arguments);
        var now = "[" + moment().format("hh:mm:ss.SS") + "] -";

        args.unshift(now);

        op.apply(null, args);
    };
};

var log = {
    debug: args.verbose ? logger(console.log) : function() {},
    info: logger(console.log),
    warn: logger(console.error),
    error: logger(console.error)
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
                    "Wrote original " + testsElmPackageJsonPath + " to",
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
                path.dirname(require.resolve("../package.json")) + "/src"
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
        var process = spawn(args["elm-test"], [args.tests, ...args._], {
            stdio: args.silent ? "ignore" : "inherit"
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
                reject();
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

function instrumentSources() {
    return new Promise(function(resolve, reject) {
        find.file(/\.elm$/, args.path, resolve);
    })
        .then(function(files) {
            files.forEach(function(file) {
                if (
                    file.includes("elm-stuff") ||
                    file.includes(args.tests) ||
                    file.includes(".coverage")
                ) {
                    log.debug("Skipping file: " + file);
                    return;
                }
                fs.copy(file, path.join(coverageDir, file));
            });
        })
        .then(function(files) {
            log.info("Instrumenting sources...");

            return new Promise(function(resolve, reject) {
                var process = spawn(elmInstrument, [coverageDir, "--yes"]);
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
    log.info("Generating report...");
    return analyzer(args.path);
}

function finishUp() {
    if (args.open) {
        log.info("All done! Opening .coverage/coverage.html");
        opn(".coverage/coverage.html", { wait: false });
    } else {
        log.info(
            "All done! Your coverage is waiting for you in .coverage/coverage.html"
        );
    }
}

function handleError(e) {
    log.error("Something went wrong: \n" + e.toString());
    process.exit(1);
}
