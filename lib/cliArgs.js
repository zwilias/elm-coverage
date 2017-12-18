var yargs = require("yargs");

module.exports = yargs
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
                .epilog("Thanks <3");
        }
    )
    .option("elm-test", {
        describe: "Path to the elm-test executable",
        default: "elm-test",
        type: "string"
    })
    .option("verbose", {
        describe: "Print debug info.",
        alias: "v",
        default: false,
        type: "boolean"
    })
    .option("open", {
        describe:
            "When writing an HTML report, it can be opened in your browser after generation",
        alias: "o",
        default: false,
        type: "boolean"
    })
    .option("force", {
        describe:
            "Forcefully continue, even when some files can't be instrumented and/or tests fail",
        alias: "f",
        default: false,
        type: "boolean"
    })
    .option("silent", {
        describe: "Suppress `elm-test` output",
        alias: "s",
        default: false,
        type: "boolean"
    })
    .option("tests", {
        describe: "Path to your tests. Will be passed along to `elm-test`.",
        alias: "t",
        default: "tests/",
        type: "string"
    })
    .option("report", {
        describe: "Type of report to generate",
        alias: "r",
        default: "human",
        choices: ["human", "json", "codecov"]
    })
    .option("quiet", {
        describe: "Be really really quiet",
        alias: "q",
        default: false,
        type: "boolean"
    });
