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
    // Path to elm-test -- --elm-test
    .describe("elm-test", "Path to the elm-test executable.")
    .default("elm-test", "elm-test")
    .string("elm-test")
    // Verbose? --verbose | -v
    .describe("verbose", "Print debug info.")
    .default("verbose", false)
    .alias("verbose", "v")
    .boolean("verbose")
    // Open when done (ignored when json) --open | -o
    .describe("open", "Open the generated report in your browser.")
    .default("open", false)
    .alias("open", "o")
    .boolean("open")
    // Forcefully continue when things fail? --force | -f
    .describe(
        "force",
        "Attempt to generate coverage even when some files can't be " +
            "instrumented or tests fail"
    )
    .default("force", false)
    .alias("force", "f")
    .boolean("force")
    // Silence test-output? --silent | -s
    .describe("silent", "Suppress `elm-test` output")
    .alias("silent", "s")
    .default("silent", false)
    .boolean("silent")
    // Path to tests? --tests |  -t
    .describe("tests", "Path to your tests.")
    .default("tests", "tests/")
    .alias("tests", "t")
    .string("tests")
    // Report format
    .describe('report', 'How to report the results?')
    .alias('report', 'r')
    .default('report', 'human')
    .choices('report', ['human', 'json', 'codecov'])
    // Quiet mode? --quiet | -q
    .describe('quiet', 'Be really really quiet')
    .alias("quiet", "q")
    .default("quiet", false)
    .boolean("quiet");
