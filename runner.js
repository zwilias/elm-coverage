var Promise = require("bluebird"),
    args = require("yargs")
        .command(
            "$0 [path]",
            "Instrument files, gather coverage by running `elm-test`, aggregate and analyze the coverage and clean up.",
            function(yargs) {
                return yargs
                    .positional("path", {
                        describe:
                            "Where are your sources located? This path will be scanned (recursively) and files instrumented.",
                        type: "string",
                        default: "src/"
                    })
                    .example(
                        "$0",
                        "Instrument the files in src/, run `elm-test` without further arguments, aggregate coverage data and create a nice report in .coverage/coverage.html"
                    )
                    .example(
                        '$0 --elm-test="./node_modules/.bin/elm-test elm/src/ -- --seed=123',
                        "Instrument the files in `elm/src`, run `elm-test` (from the provided path), passing it the `--seed=123` option."
                    )

                    .epilog("Thanks <3");
            }
        )
        .describe("elm-test", "Path to the elm-test executable.")
        .default("elm-test", "elm-test")
        .string("elm-test").argv,
    find = require("find"),
    analyzer = require("./analyze"),
    _ = require("lodash"),
    fs = require("fs-extra"),
    tmp = Promise.promisifyAll(require("tmp")),
    spawn = require("cross-spawn"),
    path = require("path"),
    touch = require("touch");

var allFiles = {};

Promise.resolve()
    .then(function() {
        return new Promise(function(resolve, reject) {
            return fs
                .remove(".coverage")
                .then(function() {
                    return fs.mkdir(".coverage");
                })
                .then(resolve);
        });
    })
    .then(function() {
        return new Promise(function(resolve, reject) {
            find.file(/.elm$/, args.path, resolve);
        }).then(function(files) {
            files.forEach(function(file) {
                allFiles[file] = tmp.tmpNameSync();
            });

            return allFiles;
        });
    })
    .then(function(fileMap) {
        console.log("Creating a back up of your original sources...");
        return Promise.map(Object.keys(fileMap), function(originalFile) {
            return fs.copy(originalFile, fileMap[originalFile]);
        }).then(function() {
            console.log("Sources backed up!");

            return Object.keys(fileMap);
        });
    })
    .then(function(files) {
        console.log("Instrumenting sources...");
        return Promise.map(files, function(file) {
            return new Promise(function(resolve, reject) {
                var process = spawn(
                    "/Users/ilias/.local/bin/elm-instrument",
                    [file, "--yes"],
                    { stdio: "inherit" }
                );

                process.on("exit", function(code) {
                    if (code == 0) {
                        resolve();
                    } else {
                        reject("something fishy happened:" + code);
                    }
                });
            });
        }).then(function() {
            console.log("All sources instrumented!");
        });
    })
    .then(function() {
        console.log("Modifying tests/elm-package.json...");
        return fs
            .readJson("tests/elm-package.json")
            .then(function(elmPackage) {
                return tmp.tmpNameAsync().then(function(tmpFile) {
                    return fs
                        .copy("tests/elm-package.json", tmpFile)
                        .then(function() {
                            console.log(
                                "Wrote original elm-package.json to",
                                tmpFile
                            );
                            allFiles["tests/elm-package.json"] = tmpFile;
                            return elmPackage;
                        });
                });
            })
            .then(function(elmPackage) {
                elmPackage["native-modules"] = true;
                elmPackage["repository"] =
                    "https://github.com/user/project.git";
                elmPackage["source-directories"].push(
                    path.dirname(require.resolve("./package.json")) + "/src"
                );

                return elmPackage;
            })
            .then(function(elmPackage) {
                return fs.writeJson("tests/elm-package.json", elmPackage);
            })
            .then(function() {
                console.log("Modified tests/elm-package.json");
            });
    })
    .then(function() {
        return new Promise(function(resolve, reject) {
            var process = spawn(args["elm-test"], args._, { stdio: "inherit" });

            process.on("exit", function() {
                resolve();
            });
        });
    })
    .finally(function() {
        console.log("Cleaning up...");
        return Promise.map(Object.keys(allFiles), function(originalPath) {
            return fs.remove(originalPath).then(function() {
                return fs
                    .move(allFiles[originalPath], originalPath)
                    .then(function() {
                        touch.sync(originalPath);
                    });
            });
        }).then(function() {
            console.log("Cleanup done!");
        });
    })
    .then(function() {
        console.log("Starting analysis...");
        return analyzer(args.path);
    })
    .then(function() {
        console.log("All done! You can open .coverage/coverage.html");
    });
