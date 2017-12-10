var spawn = require("cross-spawn"),
    chai = require("chai"),
    assert = chai.assert,
    shell = require("shelljs");

var elmCoverage = require.resolve("../bin/elm-coverage");

describe("The runner", function() {
    it("prints the usage instructions when running with `--help`", function(done) {
        var process = spawn.spawn(elmCoverage, ["--help"]);
        var output = "";

        process.stderr.on("data", console.error);
        process.stdout.on("data", function(data) {
            console.log(data);
            output += data;
        });

        process.on("exit", function(exitCode) {
            assert.equal(exitCode, 0, "Expected to exit with 0 exitcode");
            assert.notEqual(output, "", "Expected to have some output");
            done();
        });
    });
});
