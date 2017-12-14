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
    .boolean("silent")
    .describe("tests", "Path to your tests.")
    .default("tests", "tests/")
    .alias("tests", "t")
    .string("tests");
