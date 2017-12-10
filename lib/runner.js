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
    opn = require("opn");

var args = yargs
    .command(
        "$0 [path]",
        "Instrument files, gather coverage by running `elm-test`, aggregate " +
            "and analyze the coverage and clean up.",
        function(yargs) {
            return yargs
                .positional("path", {
                    describe:
                        "Where are your sources located? This path will be " +
                        "scanned (recursively) and files instrumented.",
                    type: "string",
                    default: "src/"
                })
                .example(
                    "$0",
                    "Instrument the files in src/, run `elm-test` without " +
                        "further arguments, aggregate coverage data and create" +
                        "a nice report in .coverage/coverage.html"
                )
                .example(
                    '$0 --elm-test="./node_modules/.bin/elm-test elm/src/ -- --seed=123',
                    "Instrument the files in `elm/src`, run `elm-test` (from " +
                        "the provided path), passing it the `--seed=123` option."
                )

                .epilog("Thanks <3");
        }
    )
    .describe("elm-test", "Path to the elm-test executable.")
    .default("elm-test", "elm-test")
    .string("elm-test")
    .describe("verbose", "Print debug info.")
    .default("verbose", false)
    .alias("verbose", "v")
    .boolean("verbose")
    .describe("open", "Open the generated report in your browser.")
    .default("open", false)
    .boolean("open")
    .describe(
        "force",
        "Attempt to generate coverage even when some files can't be " +
            "instrumented or tests fail"
    )
    .default("force", false)
    .alias("force", "f")
    .boolean("force")
    .describe("silent", "Suppress `elm-test` output")
    .alias("silent", "s")
    .default("silent", false)
    .boolean("silent").argv;

var elmInstrument = path.join(__dirname, "..", "bin", "elm-instrument");
var allFiles = {};

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
    .then(function() {
        return new Promise(function(resolve, reject) {
            return fs
                .remove(".coverage")
                .then(function() {
                    return fs.mkdirp(path.join(".coverage", "backup"));
                })
                .then(resolve);
        });
    })
    .then(function() {
        return new Promise(function(resolve, reject) {
            find.file(/.elm$/, args.path, resolve);
        }).then(function(files) {
            files.forEach(function(file) {
                var savePath = path.join(".coverage", "backup", file);
                allFiles[file] = savePath;
            });

            return allFiles;
        });
    })
    .then(function(fileMap) {
        log.debug("Creating a back up of your original sources...");
        return Promise.map(Object.keys(fileMap), function(originalFile) {
            return fs.copy(originalFile, fileMap[originalFile]);
        }).then(function() {
            log.info(
                "Sources backed up in " + path.join(".coverage", "backup")
            );

            return Object.keys(fileMap);
        });
    })
    .then(function(files) {
        log.info("Instrumenting sources...");
        return Promise.map(files, function(file) {
            return new Promise(function(resolve, reject) {
                var process = spawn(elmInstrument, [file, "--yes"], {
                    silent: true
                });

                process.on("exit", function(code) {
                    if (code == 0) {
                        resolve({ file: file, result: true });
                    } else {
                        resolve({ file: file, result: false });
                    }
                });
            });
        }).then(function(results) {
            var failures = results.reduce(function(acc, val) {
                if (val.result === false) {
                    log.warn("Failed to instrument " + val.file);
                    acc.push(val.file);
                }
                return acc;
            }, []);

            if (failures.length > 0) {
                if (args.force) {
                    log.info(
                        "Not all sources instrumented. `--force` passed so continuing."
                    );
                    return Promise.resolve();
                }

                return Promise.reject(
                    new Error("Failed to instrument all sources")
                );
            }

            log.debug("All sources instrumented!");
        });
    })
    .then(function() {
        log.debug("Modifying tests/elm-package.json...");
        return fs
            .readJson("tests/elm-package.json")
            .then(function(elmPackage) {
                var tmpFile = path.join(
                    ".coverage",
                    "backup",
                    "test-elm-package.json"
                );
                return fs
                    .copy("tests/elm-package.json", tmpFile)
                    .then(function() {
                        log.info(
                            "Wrote original tests/elm-package.json to",
                            tmpFile
                        );
                        allFiles["tests/elm-package.json"] = tmpFile;
                        return elmPackage;
                    });
            })
            .then(function(elmPackage) {
                elmPackage["native-modules"] = true;
                elmPackage["repository"] =
                    "https://github.com/user/project.git";
                elmPackage["source-directories"].push(
                    path.dirname(require.resolve("../package.json")) + "/src"
                );

                return elmPackage;
            })
            .then(function(elmPackage) {
                return fs.writeJson("tests/elm-package.json", elmPackage);
            })
            .then(function() {
                log.debug("Modified tests/elm-package.json");
            });
    })
    .then(function() {
        log.info("Running tests...");
        return new Promise(function(resolve, reject) {
            var process = spawn(args["elm-test"], args._, {
                stdio: args.silent ? "ignore" : "inherit"
            });

            process.on("exit", function(exitCode) {
                if (exitCode === 0) {
                    log.debug("Ran tests!");
                    resolve();
                } else if (args.force) {
                    log.info(
                        "Some tests failed. `--force` passed so continuing."
                    );
                    resolve();
                } else {
                    log.error("Ruh roh, tests failed.");
                    reject();
                }
            });
        });
    })
    .finally(function() {
        log.debug("Cleaning up...");
        return Promise.map(Object.keys(allFiles), function(originalPath) {
            return fs.remove(originalPath).then(function() {
                return fs
                    .copy(allFiles[originalPath], originalPath)
                    .then(function() {
                        touch.sync(originalPath);
                    });
            });
        }).then(function() {
            log.info("Cleanup done!");
        });
    })
    .then(function() {
        log.info("Generating report...");
        return analyzer(args.path);
    })
    .then(function() {
        if (args.open) {
            log.info("All done! Opening .coverage/coverage.html");
            opn(".coverage/coverage.html", { wait: false });
        } else {
            log.info(
                "All done! Your coverage is waiting for you in .coverage/coverage.html"
            );
        }
    })
    .catch(function() {
        process.exit(1);
    });
